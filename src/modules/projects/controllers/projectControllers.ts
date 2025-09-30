import { Request, Response } from "express";
import { projectSchema } from "../dto/projectDto";
import z from "zod";

const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const createProject = async (req: Request, res: Response) => {
  try {
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
      // Sesuaikan 'MANAGER' dengan nilai di database
      return responses(
        res,
        400,
        "Manager ID tidak valid atau bukan seorang Manager."
      );
    }

    if (!testLead || testLead.role !== "test_lead") {
      // Sesuaikan 'TEST_LEAD' dengan nilai di database
      return responses(
        res,
        400,
        "Test Lead ID tidak valid atau bukan seorang Test Lead."
      );
    }

    const projects = await prisma.project.create({
      data: {
        manager: { connect: { id: manager.id } },
        testLead: { connect: { id: testLead.id } },
        title: projectData.title,
        description: projectData.description,
        priority: projectData.priority,
        status: projectData.status,
        start_date: start,
        due_date: due,
        duration: Number(duration) || null,
      },
    });

    return responses(res, 201, "Project created successfully", projects);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Create project error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const getProject = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany();
    return responses(res, 200, "Project successfully retrivied", projects);
  } catch (error) {
    console.log("Project failed to fetch");
    return responses(res, 501, null, "Internal server error");
  }
};

const updateProject = async (req: Request, res: Response) => {
  try {
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
        "Manager ID tidak valid atau bukan seorang Manager."
      );
    }

    if (!testLead || testLead.role !== "test_lead") {
      return responses(
        res,
        400,
        "Test Lead ID tidak valid atau bukan seorang Test Lead."
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
        status: projectData.status,
        start_date: start,
        due_date: due,
        duration: duration || null,
      },
    });

    return responses(res, 200, "Project updated successfully", updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Update project error:", error);
    return responses(res, 500, "Internal server erorr", error);
  }
};

const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return responses(res, 400, "Invalid project ID");
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return responses(res, 404, "Project not found");
    }

    await prisma.project.delete({
      where: { id },
    });

    return responses(res, 200, "Project deleted successfully", []);
  } catch (error) {
    console.error("Project delete failed:", error);
    return responses(res, 500, "Internal server error");
  }
};

const getProjectInformation = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        manager: {
          select: {
            name: true,
            role: true,
          },
        },
        testLead: {
          select: {
            name: true,
            role: true,
          },
        },
        features: {
          include: {
            testScenarios: true,
          },
        },
      },
    });

    if (!project) {
      return responses(res, 404, "Project not found");
    }

    const featureCount = project.features.length;

    const testScenarioCount = project.features.reduce(
      (total: number, feature: { testScenarios: any[] }) => {
        return total + feature.testScenarios.length;
      },
      0
    );

    const { features, ...projectData } = project;

    const responseData = {
      ...projectData,
      featureCount,
      testScenarioCount,
    };

    return responses(res, 200, "Project successfully retrieved", responseData);
  } catch (error) {
    console.error("Failed to get project:", error);
    return responses(res, 500, "Internal server error");
  }
};

export {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectInformation,
};
