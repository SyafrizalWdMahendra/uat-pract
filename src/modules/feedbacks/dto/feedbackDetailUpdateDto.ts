import { z } from "zod";

export const updateDetailsSchema = z.object({
  status: z.string().optional(),
  feedback_content: z.string().optional(),
  test_scenario_code: z.string().optional(),
  feature_title: z.string().optional(),
  project_priority: z.string().optional(),
});
