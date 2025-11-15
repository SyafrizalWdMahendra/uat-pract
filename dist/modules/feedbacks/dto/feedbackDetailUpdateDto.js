"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDetailsSchema = void 0;
const zod_1 = require("zod");
exports.updateDetailsSchema = zod_1.z.object({
    feature_title: zod_1.z.string().optional(),
    test_scenario_code: zod_1.z.string().optional(),
    test_scenario_test_case: zod_1.z.string().optional(),
    feedback_priority: zod_1.z.string().optional(),
    feedback_status: zod_1.z.string().optional(),
    feedback_description: zod_1.z.string().optional(),
});
