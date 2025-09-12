import z from "zod";

export const loginSchema = z.object({
  email: z.email({
    message: "Invalid email format",
  }),
  password: z
    .string({
      message: "Password must be a string",
    })
    .min(1, "Password at least 1 character long"),
});
