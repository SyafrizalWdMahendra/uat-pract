"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.scenarioSchema = zod_1.default.object({
    feature_id: zod_1.default
        .number({
        message: "Feature id must be a number",
    })
        .min(1, "Feature id at least 1 character long"),
    code: zod_1.default
        .string({
        message: "Code must be a string",
    })
        .optional(),
    test_case: zod_1.default
        .string({
        message: "Test Case must be a string",
    })
        .min(1, "Test Case at least 1 character long"),
});
