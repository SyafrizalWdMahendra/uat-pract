import z from "zod";
const feedbackHistoryStatus = z
  .enum(["open", "in_progress", "resolved", "closed"])
  .default("open");
export const feedbackHistoryScehma = z.object({
  // feedback_id: z.number().optional(),
  // user_id: z.number().optional(),
  // project_id: z.number().optional(),
  status: feedbackHistoryStatus,
  notes: z.string().optional(),
});
