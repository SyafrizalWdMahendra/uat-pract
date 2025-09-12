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

    const projects = await prisma.project.create({
      data: {
        user: {
          connect: {
            id: parsed.user_id,
          },
        },
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
        status: parsed.status,
        start_date: start,
        due_date: due,
        duration,
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

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        user: {
          connect: {
            id: parsed.user_id,
          },
        },
        title: parsed.title,
        description: parsed.description,
        priority: parsed.priority,
        status: parsed.status,
        start_date: parsed.start_date,
        due_date: parsed.due_date,
        duration: duration,
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

export { createProject, getProject, updateProject, deleteProject };
