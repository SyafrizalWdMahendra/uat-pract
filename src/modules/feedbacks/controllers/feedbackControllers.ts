import { feedbackSchema } from "../dto/feedbackDto";
import { Request, Response } from "express";
const prisma = require("../../../prisma/client");
const responses = require("../../../utils/responses");

const createFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackValidation = feedbackSchema.parse(req.body);

    const createdFeedback = await prisma.feedback.create({
      data: {
        user_id: feedbackValidation.user_id,
        test_scenario_id: feedbackValidation.test_scenario_id,
        project_id: feedbackValidation.project_id,
        feature_id: feedbackValidation.feature_id,
        description: feedbackValidation.description,
        priority: feedbackValidation.priority,
        status: feedbackValidation.status,
      },
    });

    return responses(res, 201, "Feedback successfully created", {
      createdFeedback,
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
