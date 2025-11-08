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
exports.deleteFeedbacks = exports.updateFeedbacks = exports.getFeedbacks = exports.createFeedback = void 0;
const feedbackDto_1 = require("../dto/feedbackDto");
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const createFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbackValidation = feedbackDto_1.feedbackSchema.parse(req.body);
    const createdFeedback = yield client_1.prisma.feedback.create({
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
    return (0, responses_1.responses)(res, 201, "Feedback successfully created", {
        createdFeedback,
    });
});
exports.createFeedback = createFeedback;
const getFeedbacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbacks = yield client_1.prisma.feedback.findMany();
    if (!feedbacks) {
        return (0, responses_1.responses)(res, 404, "Feedback not found", null);
    }
    return (0, responses_1.responses)(res, 200, "Feedback successfully retrivied", feedbacks);
});
exports.getFeedbacks = getFeedbacks;
const updateFeedbacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbackId = Number(req.params.id);
    const feedbackValidation = feedbackDto_1.feedbackSchema.safeParse(req.body);
    if (!feedbackValidation.success) {
        return (0, responses_1.responses)(res, 400, "Validation error", feedbackValidation.error.format());
    }
    const feedbacks = yield client_1.prisma.feedback.update({
        where: {
            id: feedbackId,
        },
        data: feedbackValidation.data,
    });
    return (0, responses_1.responses)(res, 200, "Feedback successfully updated", feedbacks);
});
exports.updateFeedbacks = updateFeedbacks;
const deleteFeedbacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbackId = Number(req.params.id);
    if (isNaN(feedbackId)) {
        return (0, responses_1.responses)(res, 400, "Invalid feedback ID", null);
    }
    const existingFeedbacks = yield client_1.prisma.feedback.findUnique({
        where: { id: feedbackId },
    });
    if (!existingFeedbacks) {
        return (0, responses_1.responses)(res, 404, "Feedback not found!", null);
    }
    yield client_1.prisma.feedback.delete({
        where: { id: feedbackId },
    });
    return (0, responses_1.responses)(res, 200, "Feedback successfully deleted", null);
});
exports.deleteFeedbacks = deleteFeedbacks;
