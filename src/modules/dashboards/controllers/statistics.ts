import { Request, Response } from "express";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    // 1. Ambil semua project, termasuk features dan test scenarios-nya
    const projects = await prisma.project.findMany({
      include: {
        features: {
          // Ambil features dari setiap project
          include: {
            testScenarios: {
              // Ambil testScenarios dari setiap feature
              select: {
                status: true, // Kita hanya butuh statusnya
              },
            },
          },
        },
      },
    });

    if (projects.length === 0) {
      // Handle jika tidak ada proyek
      return responses(res, 200, "Statistics retrieved", {
        averageProgress: 0 /* ...stats lain */,
      });
    }

    // 2. Hitung progress untuk setiap proyek
    const projectProgressList = projects.map((project: { features: any[] }) => {
      let totalScenarios = 0;
      let passedScenarios = 0;

      // Iterasi melalui setiap fitur di dalam proyek
      project.features.forEach((feature) => {
        totalScenarios += feature.testScenarios.length;
        const passedCount = feature.testScenarios.filter(
          (scenario: { status: string }) => scenario.status === "passed"
        ).length;
        passedScenarios += passedCount;
      });

      if (totalScenarios === 0) {
        return 0; // Jika proyek tidak punya test scenario, progress-nya 0
      }

      return (passedScenarios / totalScenarios) * 100;
    });

    // 3. Hitung rata-rata dari semua progress
    const totalProgressSum = projectProgressList.reduce(
      (sum: any, current: any) => sum + current,
      0
    );
    const averageProgress = totalProgressSum / projects.length;

    // --- Gabungkan dengan statistik lain ---
    const [activeProjects, totalFeatures, totalTestScenarios] =
      await Promise.all([
        prisma.project.count({ where: { status: "active" } }),
        prisma.feature.count(),
        prisma.testScenario.count(),
      ]);

    const statistics = {
      activeProjects,
      totalFeatures,
      totalTestScenarios,
      averageProgress: Math.round(averageProgress),
    };

    return responses(
      res,
      200,
      "Dashboard statistics successfully retrieved",
      statistics
    );
  } catch (error) {
    console.error("Failed to get dashboard statistics:", error);
    return responses(res, 500, "Internal server error");
  }
};

export { getDashboardStatistics };
