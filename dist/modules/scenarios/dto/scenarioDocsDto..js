"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioDocsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.scenarioDocsSchema = zod_1.default.object({
    //   project_id: z.number().int().positive(),
    doc_url: zod_1.default.string(),
});
