import { Request, Response } from "express";
import { projectSchema } from "../dto/projectDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";
import { type ProjectStatus } from "@prisma/client";

const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

interface FeatureWithScenarios {
  testScenarios: unknown[];
}

const createProject = async (req: Request, res: Response) => {
  const parsed = projectSchema.parse(req.body);

  const start = new Date(parsed.start_date);
  const due = new Date(parsed.due_date);
  const duration = Math.ceil(
    (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const { manager_id, test_lead_id, ...projectData } = parsed;

  const [manager, testLead] = await Promise.all([
    prisma.user.findUnique({ where: { id: manager_id } }),
    prisma.user.findUnique({ where: { id: test_lead_id } }),
  ]);

  if (!manager || manager.role !== "manager") {
    return responses(
      res,
      400,
      "Manager ID tidak valid atau bukan seorang Manager.",
      null
    );
  } else if (!testLead || testLead.role !== "test_lead") {
    return responses(
      res,
      400,
      "Test Lead ID tidak valid atau bukan seorang Test Lead.",
      null
    );
  }

  const projects = await prisma.project.create({
    data: {
      manager: { connect: { id: manager.id } },
      testLead: { connect: { id: testLead.id } },
      title: projectData.title,
      description: projectData.description,
      priority: projectData.priority,
      status: projectData.status as ProjectStatus,
      start_date: start,
      due_date: due,
      duration: Number(duration) || null,
    },
  });

  return responses(res, 201, "Project created successfully", projects);
};

const getProject = async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany();
  return responses(res, 200, "Project successfully retrivied", projects);
};

const updateProject = async (req: Request, res: Response) => {
  const projectId = Number(req.params.id);
  const parsed = projectSchema.parse(req.body);

  const start = new Date(parsed.start_date ?? "");
  const due = new Date(parsed.due_date ?? "");

  const duration = Math.ceil(
    (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const { manager_id, test_lead_id, ...projectData } = parsed;

  const [manager, testLead] = await Promise.all([
    prisma.user.findUnique({ where: { id: manager_id } }),
    prisma.user.findUnique({ where: { id: test_lead_id } }),
  ]);

  if (!manager || manager.role !== "manager") {
    return responses(
      res,
      400,
      "Manager ID tidak valid atau bukan seorang Manager.",
      null
    );
  }

  if (!testLead || testLead.role !== "test_lead") {
    return responses(
      res,
      400,
      "Test Lead ID tidak valid atau bukan seorang Test Lead.",
      null
    );
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      manager: { connect: { id: manager.id } },
      testLead: { connect: { id: testLead.id } },
      title: projectData.title,
      description: projectData.description,
      priority: projectData.priority,
      status: projectData.status as ProjectStatus,
      start_date: start,
      due_date: due,
      duration: duration || null,
    },
  });

  return responses(res, 200, "Project updated successfully", updatedProject);
};

const deleteProject = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return responses(res, 400, "Invalid project ID", null);
  }

  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return responses(res, 404, "Project not found", null);
  }

  await prisma.project.delete({
    where: { id },
  });

  return responses(res, 200, "Project deleted successfully", null);
};

const getProjectInformation = async (req: Request, res: Response) => {
  const projectId = Number(req.params.id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      manager_id: true,
      test_lead_id: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      start_date: true,
      due_date: true,
      duration: true,
      manager: { select: { name: true, role: true } },
      testLead: { select: { name: true, role: true } },
      features: {
        include: { testScenarios: true },
      },
    },
  });

  if (!project) {
    return responses(res, 404, "Project not found", null);
  }

  const formattedProject = {
    ...project,
    start_date: formatDate(project.start_date),
    due_date: formatDate(project.due_date),
  };

  const featureCount = project.features.length;
  const testScenarioCount = project.features.reduce(
    (total: number, feature: FeatureWithScenarios) =>
      total + feature.testScenarios.length,
    0
  );

  const { ...projectData } = formattedProject;

  const responseData = {
    ...projectData,
    featureCount,
    testScenarioCount,
  };

  return responses(res, 200, "Project successfully retrieved", responseData);
};

export {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectInformation,
};
