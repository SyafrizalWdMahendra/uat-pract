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
  // 1. Ambil 'projectId' dari query string.
  const { projectId } = req.query;

  // 2. Validasi sederhana: Jika tidak ada projectId, kembalikan array kosong.
  //    Atau kirim error jika Anda mau.
  if (!projectId || typeof projectId !== "string") {
    // Anda bisa juga mengirim error 400 di sini
    return responses(res, 200, "No projectId provided", []);
  }

  // 3. Konversi projectId ke angka.
  const idProject = parseInt(projectId, 10);

  // // 4. Validasi jika 'projectId' bukan angka (misal, "abc")
  // if (isNaN(idProject)) {
  //   return responses(res, 400, "Invalid projectId: Must be a number");
  // }

  // 5. Temukan semua features yang cocok dengan project_id
  const features = await prisma.feature.findMany({
    where: {
      project_id: idProject, // Pastikan 'project_id' adalah nama kolom di database Anda
    },
  });

  // 6. Kembalikan data yang ditemukan
  return responses(res, 200, "Features successfully retrieved", features);
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

  return responses(res, 200, "Feature successfully updated", features);
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
