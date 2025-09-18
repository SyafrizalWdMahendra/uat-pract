import z from "zod";

const PriorityEnum = z.enum(["low", "medium", "high"]);
const StatusEnum = z.enum(["active", "completed", "pending"]);

export const projectSchema = z
  .object({
    manager_id: z.number(),
    test_lead_id: z.number(),
    title: z
      .string()
      .refine((val) => val !== undefined, {
        message: "Title is required",
      })
      .refine((val) => typeof val === "string", {
        message: "Title must be a string",
      }),
    description: z.string().min(5, "Description at least 5 character long"),
    priority: PriorityEnum,
    status: StatusEnum,
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Start date tidak valid",
    }),
    due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Due date tidak valid",
    }),
    duration: z.string().optional(),
  })
  .refine((data) => new Date(data.due_date) >= new Date(data.start_date), {
    message: "Due date tidak boleh lebih awal dari start date",
    path: ["due_date"],
  });
