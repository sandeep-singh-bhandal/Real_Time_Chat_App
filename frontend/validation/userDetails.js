import { z } from "zod";

export const updateDetailsSchema = z.object({
  email: z.email("Enter an valid email").toLowerCase(),
  username: z.string().min(3, "Name too short"),
  phone: z
    .string()
    .refine((val) => val === "" || /^(\+91)?[6-9]\d{9}$/.test(val), {
      message: "Enter a valid Phone Number",
    })
    .optional(),
});
