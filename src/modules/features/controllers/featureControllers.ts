import z from "zod";
import { featureSchema } from "../dto/featureDto";
import { Request, Response } from "express";

const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const createFeature = async (req: Request, res: Response) => {
  try {
    const featureValidation = featureSchema.parse(req.body);

    const features = await prisma.feature.create({
      data: {
        project_id: featureValidation.project_id,
        title: featureValidation.title,
      },
    });

    return responses(res, 201, "Feature successfully created", features);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Create feature error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const getFeatures = async (req: Request, res: Response) => {
  try {
    const features = await prisma.feature.findMany();
    return responses(res, 200, "Feature successfully retrivied", features);
  } catch (error) {
    console.error("Feature failed retrivied");
  }
};

const updateFeatures = async (req: Request, res: Response) => {
  try {
    const featureId = Number(req.params.id);
    const featureValidation = featureSchema.parse(req.body);

    const features = await prisma.feature.update({
      where: { id: featureId },
      data: {
        project_id: featureValidation.project_id,
        title: featureValidation.title,
      },
    });

    return responses(res, 201, "Feature successfully updated", features);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Validation error", error);
    }

    console.error("Update feature error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const deleteFeatures = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return responses(res, 400, "Invalid feature ID");
    }

    const existingFeatures = await prisma.feature.findUnique({
      where: { id },
    });

    if (!existingFeatures) {
      return responses(res, 404, "Feature not found");
    }

    await prisma.feature.delete({
      where: { id },
    });

    return responses(res, 200, "Feature deleted successfully", []);
  } catch (error) {
    console.error("Feature delete failed:", error);
    return responses(res, 500, "Internal server error");
  }
};

export { createFeature, getFeatures, updateFeatures, deleteFeatures };
