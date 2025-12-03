import { scenarioSchema } from "../dto/scenarioDto.js";
import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";
const createScenarios = async (req, res) => {
  const scenarioValidation = scenarioSchema.parse(req.body);
  const scenarios = await prisma.testScenario.create({
    data: {
      ...scenarioValidation,
    },
  });
  return responses(res, 201, "Scenario successully created", scenarios);
};
const getScenarios = async (req, res) => {
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
const updateScenarios = async (req, res) => {
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
const deleteScenarios = async (req, res) => {
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
const getScenarioDocs = async (req, res) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) {
    return responses(res, 400, "Invalid project ID", null);
  }
  const scenarios = await prisma.testScenarioDocs.findFirst({
    where: { project_id: projectId },
  });
  if (!scenarios) {
    return responses(
      res,
      404,
      "Scenario document not found for this project.",
      null
    );
  }
  return responses(res, 200, "Scenario docs successfully retrieved", scenarios);
};
export {
  createScenarios,
  getScenarios,
  updateScenarios,
  deleteScenarios,
  getScenarioDocs,
};
