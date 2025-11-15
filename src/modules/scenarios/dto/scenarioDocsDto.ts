import z from "zod";

export const scenarioDocsSchema = z.object({
  //   project_id: z.number().int().positive(),
  doc_url: z.string(),
});
