"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.featureSchema = zod_1.default.object({
    project_id: zod_1.default
        .number({
        message: "Project id must be a number",
    })
        .min(1, "Project id at least 1 character long"),
    title: zod_1.default
        .string({
        message: "Title must be a string",
    })
        .min(1, "Title at least 1 character long"),
});
