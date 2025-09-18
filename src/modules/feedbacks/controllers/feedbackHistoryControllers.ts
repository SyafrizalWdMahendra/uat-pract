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
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
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

const getFeedbackHistoryById = async (req: Request, res: Response) => {
  try {
    const feedbackId = Number(req.params.id);

    const userFeedbacks = await prisma.feedbackHistory.findFirst({
      where: {
        id: feedbackId,
      },

      select: {
        status: true,

        user: {
          select: {
            name: true,
          },
        },

        feedback: {
          select: {
            description: true,
            created_at: true,
            testScenario: {
              select: {
                code: true,
                feature: {
                  select: {
                    title: true,
                  },
                },
              },
            },
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
    const feedbackHistories = await prisma.feedbackHistory.findMany();
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

export { searchFeedbackHistory, getFeedbackHistoryById, getFeedbackHistory };
