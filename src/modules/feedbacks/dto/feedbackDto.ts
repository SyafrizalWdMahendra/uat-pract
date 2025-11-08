import z from "zod";

const feedbackPriority = z.enum(["low", "medium", "high"]);
const feedbackStatus = z.enum(["open", "in_progress", "resolved", "closed"]);

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
  project_id: z
    .number({
      message: "Project id must be a number",
    })
    .min(1, "Project id at least 1 character long"),
  feature_id: z
    .number({
      message: "Feature id must be a number",
    })
    .min(1, "Feature id at least 1 character long"),
  description: z
    .string({
      message: "Description must be a string",
    })
    .optional(),
  priority: feedbackPriority,
  status: feedbackStatus,
});

export type UpdateFeedbackSchema = z.infer<typeof feedbackSchema>;
