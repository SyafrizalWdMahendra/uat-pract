import z from "zod";

const userRole = z.enum(["users", "test_lead", "manager"]);

export const registerSchema = z.object({
  name: z
    .string({ message: "Name must be a string" })
    .min(1, "Name at least 1 character long"),
  email: z
    .email({ message: "Email format not a valid" })
    .min(1, "Email at least 1 character long"),
  password: z
    .string({
      message: "Password must be a string",
    })
    .min(1, "Password at least 1 character long"),
  role: userRole,
});
