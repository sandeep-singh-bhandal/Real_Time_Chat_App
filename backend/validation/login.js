import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email("Enter an valid email").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be 8 character long")
    .max(24, "Password must be less than 24 character"),
});