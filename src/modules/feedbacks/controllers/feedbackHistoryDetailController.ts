import { Request, Response } from "express";
import { updateDetailsSchema } from "../dto/feedbackDetailUpdateDto";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";
import { type Prisma, ProjectPriority } from "@prisma/client";

const getFeedHistoryDetails = async (req: Request, res: Response) => {
  const feedHistoryId = Number(req.params.id);
  const feedHistories = await prisma.feedback.findUnique({
    where: { id: feedHistoryId },
    select: {
      id: true,
      user_id: true,
      test_scenario_id: true,
      feature_id: true,
      project_id: true,
      description: true,
      status: true,
      priority: true,
      created_at: true,
      updated_at: true,
      user: {
        select: {
          name: true,
        },
      },
      testScenario: {
        select: {
          code: true,
          test_case: true,
        },
      },
      feature: {
        select: {
          title: true,
        },
      },
    },
  });
  if (!feedHistories) {
    return responses(res, 404, "Feedback not found!", null);
  }
  return responses(
    res,
    200,
    `Feedback detail successfully retrivied`,
    feedHistories
  );
};

const updateFeedHistoryDetails = async (req: Request, res: Response) => {
  const feedbackHistoryId = Number(req.params.id);
  if (isNaN(feedbackHistoryId)) {
    return responses(res, 400, "Invalid feedback history detail ID", null);
  }

  const body = updateDetailsSchema.parse(req.body);

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const relations = await tx.feedback.findUniqueOrThrow({
        where: { id: feedbackHistoryId },
        select: {
          testScenario: {
            select: {
              id: true,
              feature: {
                select: {
                  id: true,
                  project_id: true,
                },
              },
            },
          },
        },
      });

      const testScenarioId = relations.testScenario?.id;
      const featureId = relations.testScenario?.feature?.id;
      const projectId = relations.testScenario?.feature?.project_id;

      let projectUpdateData: Prisma.ProjectUpdateInput = {};
      if (body.project_priority && projectId) {
        if (
          Object.values(ProjectPriority).includes(
            body.project_priority as ProjectPriority
          )
        ) {
          projectUpdateData = {
            priority: body.project_priority as ProjectPriority,
          };
        } else {
          throw new Error(`Invalid priority value: ${body.project_priority}`);
        }
      }

      await Promise.all([
        body.feedback_content
          ? tx.feedback.update({
              where: { id: feedbackHistoryId },
              data: { description: body.feedback_content },
            })
          : Promise.resolve(),

        body.test_scenario_code && testScenarioId
          ? tx.testScenario.update({
              where: { id: testScenarioId },
              data: { code: body.test_scenario_code },
            })
          : Promise.resolve(),

        body.feature_title && featureId
          ? tx.feature.update({
              where: { id: featureId },
              data: { title: body.feature_title },
            })
          : Promise.resolve(),

        projectId
          ? tx.project.update({
              where: { id: projectId },
              data: projectUpdateData,
            })
          : Promise.resolve(),
      ]);

      return { message: "Data terkait berhasil diperbarui" };
    }
  );

  return responses(res, 200, result.message, null);
};

export { getFeedHistoryDetails, updateFeedHistoryDetails };
