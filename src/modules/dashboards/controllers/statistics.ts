import { Request, Response } from "express";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const getDashboardStatistics = async (req: Request, res: Response) => {
  try {
    const [
      activeProjects,
      totalFeatures,
      totalTestScenarios,
      passedScenariosCount,
    ] = await Promise.all([
      prisma.project.count({ where: { status: "active" } }),
      prisma.feature.count(),
      prisma.testScenario.count(),
      prisma.testScenario.count({ where: { status: "passed" } }),
    ]);

    const averageProgress =
      totalTestScenarios > 0
        ? (passedScenariosCount / totalTestScenarios) * 100
        : 0;

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
    return responses(res, 500, "Terjadi kesalahan pada server");
  }
};

const getDashboardCurrentProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        duration: true,
        start_date: true,
        due_date: true,
        _count: {
          select: {
            features: true,
          },
        },
      },
    });

    const projectsWithScenarioCounts = await Promise.all(
      projects.map(
        async (project: {
          id: any;
          title: any;
          description: any;
          priority: any;
          status: any;
          duration: any;
          due_date: any;
          _count: { features: any };
        }) => {
          const scenarioCount = await prisma.testScenario.count({
            where: {
              feature: {
                project_id: project.id,
              },
            },
          });

          const dueDate = new Date(project.due_date);

          const day = String(dueDate.getDate()).padStart(2, "0");
          const month = String(dueDate.getMonth() + 1).padStart(2, "0");
          const year = dueDate.getFullYear();

          const formattedDueDate = `${day}/${month}/${year}`;

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            priority: project.priority,
            status: project.status,
            featureCount: project._count.features,
            testScenarioCount: scenarioCount,
            duration: project.duration ? `${project.duration} days` : null,
            due_date: formattedDueDate,
          };
        }
      )
    );

    return responses(
      res,
      200,
      "Current projects successfully retrieved",
      projectsWithScenarioCounts
    );
  } catch (error) {
    console.error("Failed to get current projects:", error);
    return responses(res, 500, "Terjadi kesalahan pada server");
  }
};

export { getDashboardStatistics, getDashboardCurrentProjects };
