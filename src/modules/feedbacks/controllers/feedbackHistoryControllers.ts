import { Request, Response } from "express";
import test from "node:test";
const responses = require("../../../utils/responses");
const prisma = require("../../../prisma/client");

const searchFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const { content, feature, author } = req.query;

    let whereClause = {};
    let selectClause = {};

    if (content) {
      whereClause = {
        description: { contains: String(content) },
      };
      selectClause = {
        description: true,
        created_at: true,
        priority: true,
        status: true,
        feature: {
          select: {
            title: true,
          },
        },
        testScenario: {
          select: {
            code: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      };
    } else if (feature) {
      whereClause = {
        feature: {
          title: { contains: String(feature) },
        },
      };
      selectClause = {
        description: true,
        created_at: true,
        priority: true,
        status: true,
        feature: {
          select: {
            title: true,
          },
        },
        testScenario: {
          select: {
            code: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      };
    } else if (author) {
      whereClause = {
        user: { name: { contains: String(author) } },
      };
      selectClause = {
        description: true,
        created_at: true,
        priority: true,
        status: true,
        feature: {
          select: {
            title: true,
          },
        },
        testScenario: {
          select: {
            code: true,
          },
        },
        user: {
          select: {
            name: true,
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

    const searchResult = await prisma.feedback.findMany({
      where: whereClause,
      select: selectClause,
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

const getFeedbackHistoryById = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);

    const userFeedbacks = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
      },

      select: {
        status: true,
        priority: true,
        description: true,
        created_at: true,
        user: {
          select: {
            name: true,
          },
        },
        testScenario: {
          select: {
            code: true,
          },
        },
        feature: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!userFeedbacks) {
      return responses(
        res,
        404,
        "Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses."
      );
    }

    return responses(
      res,
      200,
      "Data riwayat feedback berhasil diambil",
      userFeedbacks
    );
  } catch (error) {
    console.error("Gagal mengambil riwayat feedback:", error);
    return responses(res, 500, "Internal Server Error");
  }
};

const getFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const feedbackHistories = await prisma.feedback.findMany({
      select: {
        status: true,
        priority: true,
        description: true,
        created_at: true,
        user: {
          select: {
            name: true,
          },
        },
        testScenario: {
          select: {
            code: true,
          },
        },
        feature: {
          select: {
            title: true,
          },
        },
      },
    });

    return responses(
      res,
      200,
      "Feedback Histories successfully retrivied",
      feedbackHistories
    );
  } catch (error) {
    console.error("Invalid to retrivied feedback histories data", error);
    return responses(res, 500, "Internal server error");
  }
};

const deleteFeedbackHistory = async (req: Request, res: Response) => {
  try {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
      return responses(res, 400, "Invalid feedback history ID");
    }

    const existingFeedHistory = await prisma.feedback.findUnique({
      where: { id: feedHistoryId },
    });

    if (!existingFeedHistory) {
      return responses(res, 404, "Feedback history not found!");
    }

    await prisma.feedback.delete({
      where: { id: feedHistoryId },
    });

    return responses(
      res,
      200,
      "Feedback History and related Feedback successfully deleted"
    );
  } catch (error) {
    console.error("Delete feedback history error:", error);
    return responses(res, 500, "Internal server error", String(error));
  }
};

export {
  searchFeedbackHistory,
  getFeedbackHistoryById,
  getFeedbackHistory,
  deleteFeedbackHistory,
};
