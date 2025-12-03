import z from "zod";
export const featureSchema = z.object({
  project_id: z
    .number({
      message: "Project id must be a number",
    })
    .min(1, "Project id at least 1 character long"),
  title: z
    .string({
      message: "Title must be a string",
    })
    .min(1, "Title at least 1 character long"),
});
