import { Request, Response } from "express";
import { scenarioSchema } from "../dto/scenarioDto";
import z from "zod";
import { create } from "domain";
const responses = require("../../../utils/responses");
const prisma = require("../../../prisma/client");

const createScenarios = async (req: Request, res: Response) => {
  try {
    const scenarioValidation = scenarioSchema.parse(req.body);
    const scenarios = await prisma.testScenario.create({
      data: {
        feature_id: scenarioValidation.feature_id,
        code: scenarioValidation.code,
        title: scenarioValidation.title,
        expected_result: scenarioValidation.expected_result,
        actual_result: scenarioValidation.actual_result,
        description: scenarioValidation.description,
        status: scenarioValidation.status,
        type: scenarioValidation.type,
      },
    });

    return responses(res, 201, "Scenario successully created", scenarios);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Create scenario error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const getScenarios = async (req: Request, res: Response) => {
  try {
    const scenarios = await prisma.testScenario.findMany({
      select: {
        id: true,
        feature_id: true,
        code: true,
        title: true,
        status: true,
        type: true,
        created_at: true,
        updated_at: true,
      },
    });
    return responses(res, 200, "Scenario successfully retrivied", scenarios);
  } catch (error) {
    console.error("Get scenario error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const updateScenarios = async (req: Request, res: Response) => {
  try {
    const scenarioId = Number(req.params.id);
    if (isNaN(scenarioId)) {
      return responses(res, 401, "Scenario ID not found");
    }
    const scenarioValidation = scenarioSchema.parse(req.body);
    const scenarios = await prisma.testScenario.update({
      where: { id: scenarioId },
      data: {
        feature_id: scenarioValidation.feature_id,
        code: scenarioValidation.code,
        title: scenarioValidation.title,
        expected_result: scenarioValidation.expected_result,
        actual_result: scenarioValidation.actual_result,
        description: scenarioValidation.description,
        status: scenarioValidation.status,
        type: scenarioValidation.type,
      },
    });

    return responses(res, 201, "Scenario successfully updated", scenarios);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Create scenario error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const deleteScenarios = async (req: Request, res: Response) => {
  try {
    const scenarioId = Number(req.params.id);
    if (isNaN(scenarioId)) {
      return responses(res, 400, "Invalid scenario ID");
    }

    const existingScenario = await prisma.testScenario.findUnique({
      where: { id: scenarioId },
    });

    if (!existingScenario) {
      return responses(res, 404, "Scenario not found");
    }

    await prisma.testScenario.delete({
      where: { id: scenarioId },
    });

    return responses(res, 200, "Scenario successfully deleted", []);
  } catch (error) {
    console.error("Delete scenario error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

export { createScenarios, getScenarios, updateScenarios, deleteScenarios };
