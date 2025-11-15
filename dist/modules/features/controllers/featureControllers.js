import { featureSchema } from "../dto/featureDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";
const createFeature = async (req, res) => {
    const featureValidation = featureSchema.parse(req.body);
    const features = await prisma.feature.create({
        data: {
            project_id: featureValidation.project_id,
            title: featureValidation.title,
        },
    });
    return responses(res, 201, "Feature successfully created", features);
};
const getFeatures = async (req, res) => {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== "string") {
        return responses(res, 200, "No projectId provided", []);
    }
    const idProject = parseInt(projectId, 10);
    const features = await prisma.feature.findMany({
        where: {
            project_id: idProject,
        },
    });
    return responses(res, 200, "Features successfully retrieved", features);
};
const updateFeatures = async (req, res) => {
    const featureId = Number(req.params.id);
    const featureValidation = featureSchema.parse(req.body);
    const features = await prisma.feature.update({
        where: { id: featureId },
        data: {
            project_id: featureValidation.project_id,
            title: featureValidation.title,
        },
    });
    return responses(res, 200, "Feature successfully updated", features);
};
const deleteFeatures = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return responses(res, 400, "Invalid feature ID", null);
    }
    const existingFeatures = await prisma.feature.findUnique({
        where: { id },
    });
    if (!existingFeatures) {
        return responses(res, 404, "Feature not found", null);
    }
    await prisma.feature.delete({
        where: { id },
    });
    return responses(res, 200, "Feature deleted successfully", []);
};
export { createFeature, getFeatures, updateFeatures, deleteFeatures };
