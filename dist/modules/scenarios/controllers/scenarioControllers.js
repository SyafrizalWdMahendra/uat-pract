"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScenarioDocs = exports.deleteScenarios = exports.updateScenarios = exports.getScenarios = exports.createScenarios = void 0;
const scenarioDto_1 = require("../dto/scenarioDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const createScenarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scenarioValidation = scenarioDto_1.scenarioSchema.parse(req.body);
    const scenarios = yield client_1.prisma.testScenario.create({
        data: Object.assign({}, scenarioValidation),
    });
    return (0, responses_1.responses)(res, 201, "Scenario successully created", scenarios);
});
exports.createScenarios = createScenarios;
const getScenarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scenarios = yield client_1.prisma.testScenario.findMany({
        select: {
            id: true,
            feature_id: true,
            code: true,
            test_case: true,
        },
    });
    return (0, responses_1.responses)(res, 200, "Scenario successfully retrivied", scenarios);
});
exports.getScenarios = getScenarios;
const updateScenarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scenarioId = Number(req.params.id);
    if (isNaN(scenarioId)) {
        return (0, responses_1.responses)(res, 401, "Scenario ID not found", null);
    }
    const scenarioValidation = scenarioDto_1.scenarioSchema.parse(req.body);
    const scenarios = yield client_1.prisma.testScenario.update({
        where: { id: scenarioId },
        data: Object.assign({}, scenarioValidation),
    });
    return (0, responses_1.responses)(res, 201, "Scenario successfully updated", scenarios);
});
exports.updateScenarios = updateScenarios;
const deleteScenarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scenarioId = Number(req.params.id);
    if (isNaN(scenarioId)) {
        return (0, responses_1.responses)(res, 400, "Invalid scenario ID", null);
    }
    const existingScenario = yield client_1.prisma.testScenario.findUnique({
        where: { id: scenarioId },
    });
    if (!existingScenario) {
        return (0, responses_1.responses)(res, 404, "Scenario not found", null);
    }
    yield client_1.prisma.testScenario.delete({
        where: { id: scenarioId },
    });
    return (0, responses_1.responses)(res, 200, "Scenario successfully deleted", null);
});
exports.deleteScenarios = deleteScenarios;
const getScenarioDocs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = Number(req.params.id);
    if (isNaN(projectId)) {
        return (0, responses_1.responses)(res, 400, "Invalid project ID", null);
    }
    const scenarios = yield client_1.prisma.testScenarioDocs.findFirst({
        where: { project_id: projectId },
    });
    if (!scenarios) {
        return (0, responses_1.responses)(res, 404, "Scenario document not found for this project.", null);
    }
    return (0, responses_1.responses)(res, 200, "Scenario docs successfully retrieved", scenarios);
});
exports.getScenarioDocs = getScenarioDocs;
