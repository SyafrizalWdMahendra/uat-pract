import { Request, Response } from "express";
import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";

const getDashboardStatistics = async (req: Request, res: Response) => {
  const [
    activeProjects,
    totalFeatures,
    totalTestScenarios,
    // passedScenariosCount,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "active" } }),
    prisma.feature.count(),
    prisma.testScenario.count(),
    // prisma.testScenario.count({ where: { status: "passed" } }),
  ]);

  // const averageProgress =
  //   totalTestScenarios > 0
  //     ? (passedScenariosCount / totalTestScenarios) * 100
  //     : 0;

  const statistics = {
    activeProjects,
    totalFeatures,
    totalTestScenarios,
    // averageProgress: Math.round(averageProgress),
  };

  return responses(
    res,
    200,
    "Dashboard statistics successfully retrieved",
    statistics
  );
};

const getDashboardCurrentProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        due_date: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        duration: true,
        due_date: true,
        _count: {
          select: { features: true },
        },
      },
    });

    if (!projects || projects.length === 0) {
      return responses(res, 200, "No projects found matching criteria", []);
    }

    const projectsWithScenarioCounts = await Promise.all(
      projects.map(
        async (project: {
          id: any;
          due_date: string | number | Date;
          title: any;
          description: any;
          priority: any;
          status: any;
          _count: { features: any };
          duration: any;
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
      "Projects successfully retrieved",
      projectsWithScenarioCounts
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return responses(res, 500, "Internal server error", null);
  }
};

export { getDashboardStatistics, getDashboardCurrentProjects };
