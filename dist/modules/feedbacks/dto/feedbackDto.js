"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const feedbackPriority = zod_1.default.enum(["low", "medium", "high"]);
const feedbackStatus = zod_1.default.enum(["open", "in_progress", "resolved", "closed"]);
exports.feedbackSchema = zod_1.default.object({
    user_id: zod_1.default
        .number({
        message: "User id must be a number",
    })
        .min(1, "User id at least 1 character long"),
    test_scenario_id: zod_1.default
        .number({
        message: "User id must be a number",
    })
        .min(1, "User id at least 1 character long"),
    project_id: zod_1.default
        .number({
        message: "Project id must be a number",
    })
        .min(1, "Project id at least 1 character long"),
    feature_id: zod_1.default
        .number({
        message: "Feature id must be a number",
    })
        .min(1, "Feature id at least 1 character long"),
    description: zod_1.default
        .string({
        message: "Description must be a string",
    })
        .optional(),
    priority: feedbackPriority,
    status: feedbackStatus,
});
