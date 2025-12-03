import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";
const searchFeedbackHistory = async (req, res) => {
    const { content, feature, author, status, priority } = req.query;
    const selectClause = {
        id: true,
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
    const andClauses = [];
    if (content) {
        andClauses.push({
            description: { contains: String(content) },
        });
    }
    if (feature && !isNaN(Number(feature))) {
        andClauses.push({
            feature_id: { equals: Number(feature) },
        });
    }
    if (author) {
        andClauses.push({
            user: {
                name: { contains: String(author) },
            },
        });
    }
    if (status) {
        andClauses.push({
            status: { equals: status },
        });
    }
    if (priority) {
        andClauses.push({
            priority: { equals: priority },
        });
    }
    const whereClause = andClauses.length > 0 ? { AND: andClauses } : {};
    const searchResult = await prisma.feedback.findMany({
        where: whereClause,
        select: selectClause,
        orderBy: {
            created_at: "desc",
        },
    });
    return responses(res, 200, "Feedback history successfully retrieved", searchResult);
};
const getFeedbackHistoryById = async (req, res) => {
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
                    id: true,
                    name: true,
                },
            },
            testScenario: {
                select: {
                    id: true,
                    code: true,
                    test_case: true,
                },
            },
            feature: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });
    if (!userFeedbacks) {
        return responses(res, 404, "Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses.", null);
    }
    return responses(res, 200, "Data riwayat feedback berhasil diambil", userFeedbacks);
};
const getFeedbackHistory = async (req, res) => {
    const { projectId } = req.query;
    if (!projectId) {
        return res.status(400).json({ message: "projectId diperlukan" });
    }
    const feedbacks = await prisma.feedback.findMany({
        where: {
            project_id: Number(projectId),
        },
        include: {
            user: { select: { id: true, name: true } },
            testScenario: { select: { code: true, test_case: true } },
            feature: { select: { title: true } },
        },
        orderBy: {
            created_at: "desc",
        },
    });
    res.status(200).json({
        payload: {
            message: "Feedback Histories successfully retrieved",
            data: feedbacks,
        },
    });
};
const deleteFeedbackHistory = async (req, res) => {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return responses(res, 400, "Invalid feedback history ID", null);
    }
    const existingFeedHistory = await prisma.feedback.findUnique({
        where: { id: feedHistoryId },
    });
    if (!existingFeedHistory) {
        return responses(res, 404, "Feedback history not found!", null);
    }
    await prisma.feedback.delete({
        where: { id: feedHistoryId },
    });
    return responses(res, 200, "Feedback History and related Feedback successfully deleted", null);
};
export { searchFeedbackHistory, getFeedbackHistoryById, getFeedbackHistory, deleteFeedbackHistory, };
