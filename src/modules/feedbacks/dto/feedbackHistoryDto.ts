import z from "zod";
const feedbackHistoryStatus = z
  .enum(["open", "in_progress", "resolved", "closed"])
  .default("open");
export const feedbackHistoryScehma = z.object({
  status: feedbackHistoryStatus,
  notes: z.string().optional(),
});
