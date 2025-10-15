import { Request, Response } from "express";
import { scenarioSchema } from "../dto/scenarioDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

const createScenarios = async (req: Request, res: Response) => {
  const scenarioValidation = scenarioSchema.parse(req.body);
  const scenarios = await prisma.testScenario.create({
    data: {
      ...scenarioValidation,
    },
  });

  return responses(res, 201, "Scenario successully created", scenarios);
};

const getScenarios = async (req: Request, res: Response) => {
  const scenarios = await prisma.testScenario.findMany({
    select: {
      id: true,
      feature_id: true,
      code: true,
      test_case: true,
    },
  });
  return responses(res, 200, "Scenario successfully retrivied", scenarios);
};

const updateScenarios = async (req: Request, res: Response) => {
  const scenarioId = Number(req.params.id);
  if (isNaN(scenarioId)) {
    return responses(res, 401, "Scenario ID not found", null);
  }
  const scenarioValidation = scenarioSchema.parse(req.body);
  const scenarios = await prisma.testScenario.update({
    where: { id: scenarioId },
    data: {
      ...scenarioValidation,
    },
  });

  return responses(res, 201, "Scenario successfully updated", scenarios);
};

const deleteScenarios = async (req: Request, res: Response) => {
  const scenarioId = Number(req.params.id);
  if (isNaN(scenarioId)) {
    return responses(res, 400, "Invalid scenario ID", null);
  }

  const existingScenario = await prisma.testScenario.findUnique({
    where: { id: scenarioId },
  });

  if (!existingScenario) {
    return responses(res, 404, "Scenario not found", null);
  }

  await prisma.testScenario.delete({
    where: { id: scenarioId },
  });

  return responses(res, 200, "Scenario successfully deleted", null);
};

export { createScenarios, getScenarios, updateScenarios, deleteScenarios };
