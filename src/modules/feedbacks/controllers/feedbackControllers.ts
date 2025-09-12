import { feedbackSchema } from "../dto/feedbackDto";
import { Request, Response } from "express";
import { feedbackHistoryScehma } from "../dto/feedbackHistoryDto";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const createFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackValidation = feedbackSchema.parse(req.body);
    const feedHistoryValidation = feedbackHistoryScehma.parse(req.body);

    const createdFeedback = await prisma.feedback.create({
      data: {
        user_id: feedbackValidation.user_id,
        test_scenario_id: feedbackValidation.test_scenario_id,
        description: feedbackValidation.description,
      },
    });

    const testScenario = await prisma.testScenario.findUnique({
      where: { id: feedbackValidation.test_scenario_id },
      select: { feature_id: true },
    });

    if (!testScenario) {
      throw new Error("Test scenario not found");
    }

    const feature = await prisma.feature.findUnique({
      where: { id: testScenario.feature_id },
      select: { project_id: true },
    });

    if (!feature) {
      throw new Error("Feature not found");
    }

    const createdHistory = await prisma.feedbackHistory.create({
      data: {
        feedback_id: createdFeedback.id,
        user_id: feedbackValidation.user_id,
        project_id: feature.project_id,
        status: feedHistoryValidation.status,
        notes: feedHistoryValidation.notes || null,
      },
    });

    return responses(res, 201, "Feedback successfully created", {
      createdFeedback,
      createdHistory,
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    return responses(res, 500, "Internal server error", String(error));
  }
};

const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany();
    if (!feedbacks) {
      return responses(res, 404, "Feedback not found");
    }
    return responses(res, 200, "Feedback successfully retrivied", feedbacks);
  } catch (error) {
    console.error("Getting feedback error:", error);
    return responses(res, 500, "Internal server error", String(error));
  }
};

const updateFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    const feedbackValidation = feedbackSchema.safeParse(req.body);
    if (!feedbackValidation.success) {
      return responses(
        res,
        400,
        "Validation error",
        feedbackValidation.error.format()
      );
    }

    const feedbacks = await prisma.feedback.update({
      where: {
        id: feedbackId,
      },
      data: feedbackValidation.data,
    });

    return responses(res, 201, "Feedback successfully updated", feedbacks);
  } catch (error) {
    console.error("Update feedback error:", error);
    return responses(res, 500, "Internal server error", error);
  }
};

const deleteFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);
    if (isNaN(feedbackId)) {
      return responses(res, 400, "Invalid feedback ID");
    }
    const existingFeedbacks = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });
    if (!existingFeedbacks) {
      return responses(res, 404, "Feedback not found!");
    }
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });
    return responses(res, 201, "Feedback successfully deleted", []);
  } catch (error) {
    console.error("Delete feedback error:", error);
    return responses(res, 500, "Internal server error", String(error));
  }
};

export { createFeedback, getFeedbacks, updateFeedbacks, deleteFeedbacks };
