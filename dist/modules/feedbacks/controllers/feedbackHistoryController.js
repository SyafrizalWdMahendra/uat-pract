"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeedbackHistory = exports.getFeedbackHistory = exports.getFeedbackHistoryById = exports.searchFeedbackHistory = void 0;
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const searchFeedbackHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    let whereClause = {
        AND: [],
    };
    if (content) {
        whereClause.AND.push({
            description: { contains: String(content) },
        });
    }
    if (feature) {
        whereClause.AND.push({
            featureId: { equals: String(feature) },
        });
    }
    if (author) {
        whereClause.AND.push({
            user: {
                name: { contains: String(author) },
            },
        });
    }
    if (status) {
        whereClause.AND.push({
            status: { equals: String(status) },
        });
    }
    if (priority) {
        whereClause.AND.push({
            priority: { equals: String(priority) },
        });
    }
    if (whereClause.AND.length === 0) {
        whereClause = {};
    }
    const searchResult = yield client_1.prisma.feedback.findMany({
        where: whereClause,
        select: selectClause,
        orderBy: {
            created_at: "desc",
        },
    });
    return (0, responses_1.responses)(res, 200, "Feedback history successfully retrieved", searchResult);
});
exports.searchFeedbackHistory = searchFeedbackHistory;
const getFeedbackHistoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbackId = Number(req.params.id);
    const userFeedbacks = yield client_1.prisma.feedback.findFirst({
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
        return (0, responses_1.responses)(res, 404, "Riwayat feedback tidak ditemukan atau Anda tidak memiliki akses.", null);
    }
    return (0, responses_1.responses)(res, 200, "Data riwayat feedback berhasil diambil", userFeedbacks);
});
exports.getFeedbackHistoryById = getFeedbackHistoryById;
const getFeedbackHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.query;
    if (!projectId) {
        return res.status(400).json({ message: "projectId diperlukan" });
    }
    const feedbacks = yield client_1.prisma.feedback.findMany({
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
});
exports.getFeedbackHistory = getFeedbackHistory;
const deleteFeedbackHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return (0, responses_1.responses)(res, 400, "Invalid feedback history ID", null);
    }
    const existingFeedHistory = yield client_1.prisma.feedback.findUnique({
        where: { id: feedHistoryId },
    });
    if (!existingFeedHistory) {
        return (0, responses_1.responses)(res, 404, "Feedback history not found!", null);
    }
    yield client_1.prisma.feedback.delete({
        where: { id: feedHistoryId },
    });
    return (0, responses_1.responses)(res, 200, "Feedback History and related Feedback successfully deleted", null);
});
exports.deleteFeedbackHistory = deleteFeedbackHistory;
