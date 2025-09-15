import { Request, Response } from "express";
const responses = require("../../../utils/responses");
const prisma = require("../../../prisma/client");

const searchFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const { content, feature, author } = req.query;

    let whereClause = {};
    let includeClause = {};

    if (content) {
      whereClause = {
        feedback: {
          description: { contains: String(content) },
        },
      };
      includeClause = {
        feedback: true,
      };
    } else if (feature) {
      whereClause = {
        feedback: {
          testScenario: {
            feature: {
              title: { contains: String(feature) },
            },
          },
        },
      };
      includeClause = {
        feedback: {
          include: {
            testScenario: {
              include: {
                feature: true,
              },
            },
          },
        },
      };
    } else if (author) {
      whereClause = {
        feedback: {
          user: { name: { contains: String(author) } },
        },
      };
      includeClause = {
        feedback: {
          include: {
            user: true,
          },
        },
      };
    } else {
      return responses(
        res,
        400,
        "A valid search parameter (content, feature, or author) is required"
      );
    }

    const searchResult = await prisma.feedbackHistory.findMany({
      where: whereClause,
      include: includeClause,
    });

    if (searchResult.length === 0) {
      return responses(
        res,
        404,
        "No feedback history found matching your criteria"
      );
    }

    return responses(
      res,
      200,
      "Feedback history successfully retrieved",
      searchResult
    );
  } catch (error) {
    console.error("Searching feedback history failed:", error);
    return responses(res, 500, "Internal server error", String(error));
  }
};

const getFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const feedbackHistories = await prisma.feedbackHistory.findMany();
    return responses(
      res,
      200,
      "Feedback history successfully retrivied",
      feedbackHistories
    );
  } catch (error) {
    console.error("Feedback invalid retrivied");
    return responses(res, 500, "Internal server error", error);
  }
};

export { searchFeedbackHistory, getFeedbackHistory };
