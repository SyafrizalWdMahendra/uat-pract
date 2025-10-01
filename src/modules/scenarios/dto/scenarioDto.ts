import z from "zod";

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
  test_case: z
    .string({
      message: "Test Case must be a string",
    })
    .min(1, "Test Case at least 1 character long"),
});
