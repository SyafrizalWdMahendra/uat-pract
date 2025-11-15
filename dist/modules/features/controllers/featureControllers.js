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
exports.deleteFeatures = exports.updateFeatures = exports.getFeatures = exports.createFeature = void 0;
const featureDto_1 = require("../dto/featureDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const createFeature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const featureValidation = featureDto_1.featureSchema.parse(req.body);
    const features = yield client_1.prisma.feature.create({
        data: {
            project_id: featureValidation.project_id,
            title: featureValidation.title,
        },
    });
    return (0, responses_1.responses)(res, 201, "Feature successfully created", features);
});
exports.createFeature = createFeature;
const getFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== "string") {
        return (0, responses_1.responses)(res, 200, "No projectId provided", []);
    }
    const idProject = parseInt(projectId, 10);
    const features = yield client_1.prisma.feature.findMany({
        where: {
            project_id: idProject,
        },
    });
    return (0, responses_1.responses)(res, 200, "Features successfully retrieved", features);
});
exports.getFeatures = getFeatures;
const updateFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const featureId = Number(req.params.id);
    const featureValidation = featureDto_1.featureSchema.parse(req.body);
    const features = yield client_1.prisma.feature.update({
        where: { id: featureId },
        data: {
            project_id: featureValidation.project_id,
            title: featureValidation.title,
        },
    });
    return (0, responses_1.responses)(res, 200, "Feature successfully updated", features);
});
exports.updateFeatures = updateFeatures;
const deleteFeatures = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return (0, responses_1.responses)(res, 400, "Invalid feature ID", null);
    }
    const existingFeatures = yield client_1.prisma.feature.findUnique({
        where: { id },
    });
    if (!existingFeatures) {
        return (0, responses_1.responses)(res, 404, "Feature not found", null);
    }
    yield client_1.prisma.feature.delete({
        where: { id },
    });
    return (0, responses_1.responses)(res, 200, "Feature deleted successfully", []);
});
exports.deleteFeatures = deleteFeatures;
