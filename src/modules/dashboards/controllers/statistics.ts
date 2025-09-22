import { Request, Response } from "express";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        features: {
          include: {
            testScenarios: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    if (projects.length === 0) {
      return responses(res, 200, "Statistics retrieved", {
        averageProgress: 0,
      });
    }

    const projectProgressList = projects.map((project: { features: any[] }) => {
      let totalScenarios = 0;
      let passedScenarios = 0;

      project.features.forEach((feature) => {
        totalScenarios += feature.testScenarios.length;
        const passedCount = feature.testScenarios.filter(
          (scenario: { status: string }) => scenario.status === "passed"
        ).length;
        passedScenarios += passedCount;
      });

      if (totalScenarios === 0) {
        return 0;
      }

      return (passedScenarios / totalScenarios) * 100;
    });

    const totalProgressSum = projectProgressList.reduce(
      (sum: any, current: any) => sum + current,
      0
    );
    const averageProgress = totalProgressSum / projects.length;

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

const getDashboardCurrentProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        features: {
          include: {
            testScenarios: true,
          },
        },
      },
    });

    const projectsWithCounts = projects.map(
      (project: { [x: string]: any; features: any }) => {
        const featureCount = project.features.length;

        const testScenarioCount = project.features.reduce(
          (total: any, feature: { testScenarios: string | any[] }) => {
            return total + feature.testScenarios.length;
          },
          0
        );

        const { features, ...projectData } = project;

        return {
          ...projectData,
          featureCount,
          testScenarioCount,
        };
      }
    );

    return responses(
      res,
      200,
      "Current projects successfully retrieved",
      projectsWithCounts
    );
  } catch (error) {
    console.error("Failed to get current projects:", error);
    return responses(res, 500, "Internal server error");
  }
};

export { getDashboardStatistics, getDashboardCurrentProjects };
