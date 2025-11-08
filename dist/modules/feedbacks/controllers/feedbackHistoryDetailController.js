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
exports.updateFeedHistoryDetails = exports.getFeedHistoryDetails = void 0;
const feedbackDetailUpdateDto_1 = require("../dto/feedbackDetailUpdateDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const getFeedHistoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return (0, responses_1.responses)(res, 400, "Invalid feedback ID", null);
    }
    const feedHistories = yield client_1.prisma.feedback.findUnique({
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
    if (!feedHistories) {
        return (0, responses_1.responses)(res, 404, "Feedback not found!", null);
    }
    return (0, responses_1.responses)(res, 200, "Feedback detail successfully retrieved", feedHistories);
});
exports.getFeedHistoryDetails = getFeedHistoryDetails;
const updateFeedHistoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedHistoryId = Number(req.params.id);
    if (isNaN(feedHistoryId)) {
        return (0, responses_1.responses)(res, 400, "Invalid feedback ID", null);
    }
    const validation = feedbackDetailUpdateDto_1.updateDetailsSchema.safeParse(req.body);
    if (!validation.success) {
        return (0, responses_1.responses)(res, 400, "Validation error", {
            errors: validation.error.flatten().fieldErrors,
        });
    }
    const { feature_title, test_scenario_code, test_scenario_test_case, feedback_priority, feedback_status, feedback_description, } = validation.data;
    const existingFeedback = yield client_1.prisma.feedback.findUnique({
        where: { id: feedHistoryId },
        select: { id: true, project_id: true, feature_id: true },
    });
    if (!existingFeedback) {
        return (0, responses_1.responses)(res, 404, "Feedback not found!", null);
    }
    const updateData = {};
    if (feedback_priority !== undefined && feedback_priority !== null) {
        updateData.priority = feedback_priority;
    }
    if (feedback_status !== undefined && feedback_status !== null) {
        updateData.status = feedback_status;
    }
    if (feedback_description !== undefined && feedback_description !== null) {
        updateData.description = feedback_description;
    }
    if (feature_title) {
        const feature = yield client_1.prisma.feature.findFirst({
            where: {
                title: feature_title,
                project_id: existingFeedback.project_id,
            },
            select: { id: true },
        });
        if (!feature) {
            return (0, responses_1.responses)(res, 404, `Feature with title "${feature_title}" not found`, null);
        }
        updateData.feature_id = feature.id;
    }
    if (test_scenario_code || test_scenario_test_case) {
        const targetFeatureId = updateData.feature_id || existingFeedback.feature_id;
        const whereClause = {
            feature_id: targetFeatureId,
        };
        if (test_scenario_code) {
            whereClause.code = test_scenario_code;
        }
        if (test_scenario_test_case) {
            whereClause.test_case = test_scenario_test_case;
        }
        const testScenario = yield client_1.prisma.testScenario.findFirst({
            where: whereClause,
            select: { id: true },
        });
        if (!testScenario) {
            return (0, responses_1.responses)(res, 404, "Test scenario not found with given criteria", null);
        }
        updateData.test_scenario_id = testScenario.id;
    }
    if (Object.keys(updateData).length === 0) {
        return (0, responses_1.responses)(res, 400, "No valid fields to update", null);
    }
    const updatedFeedback = yield client_1.prisma.feedback.update({
        where: { id: feedHistoryId },
        data: updateData,
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
    return (0, responses_1.responses)(res, 200, "Feedback successfully updated", updatedFeedback);
});
exports.updateFeedHistoryDetails = updateFeedHistoryDetails;
