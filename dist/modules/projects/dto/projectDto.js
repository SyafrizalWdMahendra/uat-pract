"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const PriorityEnum = zod_1.default.enum(["low", "medium", "high"]);
const StatusEnum = zod_1.default.enum(["active", "completed", "pending"]);
exports.projectSchema = zod_1.default
    .object({
    manager_id: zod_1.default.number(),
    test_lead_id: zod_1.default.number(),
    title: zod_1.default
        .string()
        .refine((val) => val !== undefined, {
        message: "Title is required",
    })
        .refine((val) => typeof val === "string", {
        message: "Title must be a string",
    }),
    description: zod_1.default.string().min(5, "Description at least 5 character long"),
    priority: PriorityEnum,
    status: StatusEnum,
    start_date: zod_1.default.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date tidak valid",
    }),
    due_date: zod_1.default.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Due date tidak valid",
    }),
    duration: zod_1.default.number().optional(),
})
    .refine((data) => new Date(data.due_date) >= new Date(data.start_date), {
    message: "Due date tidak boleh lebih awal dari start date",
    path: ["due_date"],
});
