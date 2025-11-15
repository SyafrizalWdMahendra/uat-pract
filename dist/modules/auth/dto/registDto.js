"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const userRole = zod_1.default.enum(["users", "test_lead", "manager"]);
exports.registerSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "Name must be a string" })
        .min(1, "Name at least 1 character long"),
    email: zod_1.default
        .email({ message: "Email format not a valid" })
        .min(1, "Email at least 1 character long"),
    password: zod_1.default
        .string({
        message: "Password must be a string",
    })
        .min(1, "Password at least 1 character long"),
    role: userRole,
});
