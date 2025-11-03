import { z } from "zod";

export const updateDetailsSchema = z.object({
  feature_title: z.string().optional(),
  test_scenario_code: z.string().optional(),
  test_scenario_test_case: z.string().optional(),
  feedback_priority: z.string().optional(),
  feedback_status: z.string().optional(),
  feedback_description: z.string().optional(),
});
