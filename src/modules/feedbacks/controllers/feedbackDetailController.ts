import { Request, Response } from "express";
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

export { getFeedHistoryDetails };
