import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Name too short"),
    email: z.email("Enter an valid email"),
    password: z
      .string()
      .min(8, "Password must be 8 character long")
      .max(24, "Password must be less than 24 character")
      .regex(/[A-Z]/, "Password must contain a Capital Letter")
      .regex(/[a-z]/, "Password must contain a Small Letter")
      .regex(/[0-9]/, "Password must contain a Number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a Special Character")
      .regex(/^\S*$/, "Password should not contain any spaces"),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password do not match",
      });
    }
  });