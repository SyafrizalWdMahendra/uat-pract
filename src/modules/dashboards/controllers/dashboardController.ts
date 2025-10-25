import { Request, Response } from "express";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

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
  const project = await prisma.project.findFirst({
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

  if (!project) {
    return responses(res, 404, "No active projects found", null);
  }

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

  const projectResponse = {
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

  return responses(
    res,
    200,
    "Current project successfully retrieved",
    projectResponse
  );
};
export { getDashboardStatistics, getDashboardCurrentProjects };
