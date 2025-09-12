import z from "zod";

const testScenarioStatus = z.enum([
  "not_started",
  "in_progress",
  "passed",
  "failed",
  "blocked",
]);
const testScenarioType = z.enum(["general", "global", "feature"]);

export const scenarioSchema = z.object({
  feature_id: z
    .number({
      message: "Feature id must be a number",
    })
    .min(1, "Feature id at least 1 character long"),
  code: z
    .string({
      message: "Code must be a string",
    })
    .optional(),
  title: z
    .string({
      message: "Title must be a string",
    })
    .min(1, "Title at least 1 character long"),
  description: z
    .string({
      message: "Description must be a string",
    })
    .optional(),
  expected_result: z
    .string({
      message: "Expected result must be a string",
    })
    .optional(),
  actual_result: z
    .string({
      message: "Actual result must be a string",
    })
    .optional(),
  status: testScenarioStatus,
  type: testScenarioType,
});
