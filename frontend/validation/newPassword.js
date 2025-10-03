import { z } from "zod";

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be 8 character long")
      .max(24, "Password must be less than 24 character")
      .regex(/[A-Z]/, "Password must contain a Capital Letter")
      .regex(/[a-z]/, "Password must contain a Small Letter")
      .regex(/[0-9]/, "Password must contain a Number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a Special Character")
      .regex(/^\S*$/, "Password should not contain any spaces"),
    confirmNewPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "Password do not match",
      });
    }
  });

export const emailSchema = z.object({
  email: z.email("Enter an valid email").toLowerCase(),
});
