import { Request, Response } from "express";
import { feedbackHistoryScehma } from "../dto/feedbackHistoryDto";
import { feedbackSchema } from "../dto/feedbackDto";
import { scenarioSchema } from "../../scenarios/dto/scenarioDto";
import { projectSchema } from "../../projects/dto/projectDto";
import { featureSchema } from "../../features/dto/featureDto";
import z from "zod";
import { updateDetailsSchema } from "../dto/feedbackDetailUpdateDto";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const getFeedHistoryDetails = async (req: Request, res: Response) => {
  try {
    const feedHistoryId = Number(req.params.id);
    const feedHistories = await prisma.feedbackHistory.findUnique({
      where: { id: feedHistoryId },
    });
    if (!feedHistories) {
      return responses(res, 404, "Feedback not found!");
    }
    return responses(
      res,
      200,
      `Feedback detail successfully retrivied`,
      feedHistories
    );
  } catch (error) {
    console.error("Feedback failed to retrivied");
    return responses(res, 500, "Internal server error", error);
  }
};

const updateFeedHistoryDetails = async (req: Request, res: Response) => {
  try {
    const feedbackHistoryId = Number(req.params.id);
    if (isNaN(feedbackHistoryId)) {
      return responses(res, 404, "ID riwayat feedback tidak valid");
    }

    const body = updateDetailsSchema.parse(req.body);

    const result = await prisma.$transaction(
      async (tx: {
        feedbackHistory: {
          findUniqueOrThrow: (arg0: {
            where: { id: number };
            select: {
              feedback: {
                select: {
                  id: boolean;
                  testScenario: {
                    select: {
                      id: boolean;
                      feature: {
                        select: {
                          id: boolean;
                          project_id: boolean;
                        };
                      };
                    };
                  };
                };
              };
            };
          }) => any;
          update: (arg0: {
            where: { id: number };
            data: { status: string };
          }) => any;
        };
        feedback: {
          update: (arg0: {
            where: { id: any };
            data: { description: string };
          }) => any;
        };
        testScenario: {
          update: (arg0: { where: { id: any }; data: { code: string } }) => any;
        };
        feature: {
          update: (arg0: {
            where: { id: any };
            data: { title: string };
          }) => any;
        };
        project: {
          update: (arg0: {
            where: { id: any };
            data: { priority: string };
          }) => any;
        };
      }) => {
        // Langkah 1: Dapatkan semua ID relasi dalam satu query
        const relations = await tx.feedbackHistory.findUniqueOrThrow({
          where: { id: feedbackHistoryId },
          select: {
            feedback: {
              select: {
                id: true, // ID dari tabel Feedback
                testScenario: {
                  select: {
                    id: true, // ID dari tabel TestScenario
                    feature: {
                      select: {
                        id: true, // ID dari tabel Feature
                        project_id: true, // ID dari tabel Project
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Ekstrak semua ID agar lebih mudah dibaca
        const feedbackId = relations.feedback?.id;
        const testScenarioId = relations.feedback?.testScenario?.id;
        const featureId = relations.feedback?.testScenario?.feature?.id;
        const projectId = relations.feedback?.testScenario?.feature?.project_id;

        // Langkah 2: Lakukan semua update secara kondisional
        if (body.status) {
          await tx.feedbackHistory.update({
            where: { id: feedbackHistoryId },
            data: { status: body.status },
          });
        }

        if (body.feedback_content && feedbackId) {
          await tx.feedback.update({
            where: { id: feedbackId },
            data: { description: body.feedback_content },
          });
        }

        if (body.test_scenario_code && testScenarioId) {
          await tx.testScenario.update({
            where: { id: testScenarioId },
            data: { code: body.test_scenario_code },
          });
        }

        if (body.feature_title && featureId) {
          await tx.feature.update({
            where: { id: featureId },
            data: { title: body.feature_title },
          });
        }

        if (body.project_priority && projectId) {
          await tx.project.update({
            where: { id: projectId },
            data: { priority: body.project_priority },
          });
        }

        return { message: "Data terkait berhasil diperbarui" };
      }
    );

    return responses(res, 200, result.message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses(res, 400, "Input tidak valid", error);
    }
    console.error("Gagal memperbarui riwayat feedback:", error);
    return responses(res, 500, "Internal Server Error");
  }
};

export { getFeedHistoryDetails, updateFeedHistoryDetails };
