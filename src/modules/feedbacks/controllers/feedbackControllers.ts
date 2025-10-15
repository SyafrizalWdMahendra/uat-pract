import { feedbackSchema } from "../dto/feedbackDto";
import { Request, Response } from "express";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

const createFeedback = async (req: Request, res: Response) => {
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
};

const getFeedbacks = async (req: Request, res: Response) => {
  const feedbacks = await prisma.feedback.findMany();
  if (!feedbacks) {
    return responses(res, 404, "Feedback not found", null);
  }
  return responses(res, 200, "Feedback successfully retrivied", feedbacks);
};

const updateFeedbacks = async (req: Request, res: Response) => {
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
};

const deleteFeedbacks = async (req: Request, res: Response) => {
  const feedbackId = Number(req.params.id);
  if (isNaN(feedbackId)) {
    return responses(res, 400, "Invalid feedback ID", null);
  }
  const existingFeedbacks = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });
  if (!existingFeedbacks) {
    return responses(res, 404, "Feedback not found!", null);
  }
  await prisma.feedback.delete({
    where: { id: feedbackId },
  });
  return responses(res, 201, "Feedback successfully deleted", null);
};

export { createFeedback, getFeedbacks, updateFeedbacks, deleteFeedbacks };
