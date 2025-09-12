import z from "zod";

export const feedbackSchema = z.object({
  user_id: z
    .number({
      message: "User id must be a number",
    })
    .min(1, "User id at least 1 character long"),
  test_scenario_id: z
    .number({
      message: "User id must be a number",
    })
    .min(1, "User id at least 1 character long"),
  description: z
    .string({
      message: "Description must be a string",
    })
    .optional(),
});
