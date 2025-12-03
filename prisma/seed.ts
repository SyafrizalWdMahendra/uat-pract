import { ProjectPriority, ProjectStatus } from "../src/generated/client.js";
import { PrismaClient } from "@prisma/client";

import {
  docUrl,
  featuresProject1,
  featuresProject2,
  testScenariosFeature1,
  testScenariosFeature2,
} from "./seed/utils.js";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function seedUsers() {
  console.log("\n🌱 Seeding users...");
  const hashedPassword = await hash("SeedPassword123!", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager.seed@gmail.com" },
    update: {},
    create: {
      name: "Manager",
      email: "manager.seed@gmail.com",
      password: hashedPassword,
      role: "manager",
    },
  });

  const testLead = await prisma.user.upsert({
    where: { email: "testlead.seed@gmail.com" },
    update: {},
    create: {
      name: "Test Lead",
      email: "testlead.seed@gmail.com",
      password: hashedPassword,
      role: "test_lead",
    },
  });

  console.log(`✅ Created/found: ${manager.name}, ${testLead.name}`);
  return { manager, testLead };
}

async function seedProjects(managerId: number, testLeadId: number) {
  console.log("\n🌱 Seeding projects...");

  const project1 = await prisma.project.upsert({
    where: { id: 1 },

    update: {
      testScenarioDocs: {
        upsert: {
          where: { project_id: 1 },
          update: { doc_url: docUrl.docUrl1.doc_url },
          create: { doc_url: docUrl.docUrl1.doc_url },
        },
      },
    },

    create: {
      id: 1,
      title: "PSIKOTESIA v1.0",
      description: "Complete UAT for PSIKOTESIA Web Application.",
      manager_id: managerId,
      test_lead_id: testLeadId,
      priority: ProjectPriority.high,
      status: ProjectStatus.active,
      start_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      duration: 30,
      testScenarioDocs: {
        create: {
          doc_url: docUrl.docUrl1.doc_url,
        },
      },
    },

    include: {
      testScenarioDocs: true,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 2 },

    update: {
      title: "cmlabs Connect v1.0",
      description: "Complete UAT for cmlabs Connect Web Application.",
      manager_id: managerId,
      test_lead_id: testLeadId,
      priority: ProjectPriority.high,
      status: ProjectStatus.active,
      testScenarioDocs: {
        upsert: {
          where: { project_id: 2 },
          update: { doc_url: docUrl.docUrl2.doc_url },
          create: { doc_url: docUrl.docUrl2.doc_url },
        },
      },
    },

    create: {
      id: 2,
      title: "cmlabs Connect v1.0",
      description: "Complete UAT for cmlabs Connect Web Application.",
      manager_id: managerId,
      test_lead_id: testLeadId,
      priority: ProjectPriority.high,
      status: ProjectStatus.active,
      start_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 60)),
      duration: 60,
      testScenarioDocs: {
        create: {
          doc_url: docUrl.docUrl2.doc_url,
        },
      },
    },

    include: {
      testScenarioDocs: true,
    },
  });

  console.log("Proyek 2 dibuat/diupdate:", project2);

  console.log(`✅ Created/found: ${project1.title}, ${project2.title}`);
}

async function seedFeatures() {
  console.log("\n🌱 Seeding features...");
  const allFeatures = [...featuresProject1, ...featuresProject2];
  let created = 0;
  let skipped = 0;
  const featureMap = new Map<string, number>();

  for (const feature of allFeatures) {
    const featureKey = `${feature.title}-${feature.project_id}`;

    try {
      const existing = await prisma.feature.findFirst({
        where: {
          title: feature.title,
          project_id: feature.project_id,
        },
      });

      if (existing) {
        featureMap.set(featureKey, existing.id);
        skipped++;
      } else {
        const newFeature = await prisma.feature.create({ data: feature });
        console.log(`✅ Created: ${feature.title}`);
        featureMap.set(featureKey, newFeature.id);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error creating ${feature.title}:`, error);
    }
  }

  console.log(`\n📊 features Summary: ${created} created, ${skipped} skipped`);
  return { created, skipped, featureMap };
}

async function seedTestScenarios(featureMap: Map<string, number>) {
  console.log("\n🌱 Seeding test scenarios...");

  const getActualFeatureId = (
    originalFeatureId: number,
    projectId: number
  ): number | null => {
    let featureTitle: string | undefined;

    if (projectId === 1) {
      featureTitle = featuresProject1[originalFeatureId - 1]?.title;
    } else if (projectId === 2) {
      featureTitle = featuresProject2[originalFeatureId - 1]?.title;
    }

    if (!featureTitle) {
      console.warn(
        `Gagal menemukan judul fitur untuk ID ${originalFeatureId} di Proyek ${projectId}`
      );
      return null;
    }

    return featureMap.get(`${featureTitle}-${projectId}`) || null;
  };

  const allScenarios = [
    ...testScenariosFeature1.map((s) => ({
      ...s,
      feature_id: getActualFeatureId(s.feature_id, 1),
    })),
    ...testScenariosFeature2.map((s) => ({
      ...s,
      feature_id: getActualFeatureId(s.feature_id, 1),
    })),
  ];

  const validScenarios = allScenarios.filter((s) => {
    if (s.feature_id === null) {
      console.warn(
        `⏭️  Skipping scenario "${s.code}". Gagal memetakan feature_id.`
      );
      return false;
    }
    return true;
  }) as ((typeof allScenarios)[0] & { feature_id: number })[];

  try {
    const result = await prisma.testScenario.createMany({
      data: validScenarios,
      skipDuplicates: true,
    });

    console.log(`\n📊 test scenarios Summary: ${result.count} created`);
    return {
      created: result.count,
      skipped: allScenarios.length - result.count,
    };
  } catch (error) {
    console.error(`❌ Error creating test scenarios:`, error);
    return { created: 0, skipped: allScenarios.length };
  }
}

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    const { manager, testLead } = await seedUsers();
    await seedProjects(manager.id, testLead.id);

    const featureStats = await seedFeatures();
    const scenarioStats = await seedTestScenarios(featureStats.featureMap);

    console.log("\n" + "=".repeat(50));
    console.log("✨ All seeding completed successfully!");
    console.log("=".repeat(50));
    console.log(
      `📊 Total Features: ${featureStats.created} created, ${featureStats.skipped} skipped`
    );
    console.log(
      `📊 Total Test Scenarios: ${scenarioStats.created} created, ${scenarioStats.skipped} skipped`
    );
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Database connection closed\n");
  });
