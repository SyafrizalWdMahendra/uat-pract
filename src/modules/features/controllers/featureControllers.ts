import { featureSchema } from "../dto/featureDto";
import { Request, Response } from "express";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

const createFeature = async (req: Request, res: Response) => {
  const featureValidation = featureSchema.parse(req.body);

  const features = await prisma.feature.create({
    data: {
      project_id: featureValidation.project_id,
      title: featureValidation.title,
    },
  });

  return responses(res, 201, "Feature successfully created", features);
};

const getFeatures = async (req: Request, res: Response) => {
  const features = await prisma.feature.findMany();
  return responses(res, 200, "Feature successfully retrivied", features);
};

const updateFeatures = async (req: Request, res: Response) => {
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
};

const deleteFeatures = async (req: Request, res: Response) => {
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
