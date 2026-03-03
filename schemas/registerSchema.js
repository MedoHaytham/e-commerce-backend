import z from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, 'firstName must be at least 3 characters long')
    .max(30, 'firstName must be at most 30 characters long'),

  lastName: z
    .string()
    .trim()
    .min(3, 'lastName must be at least 3 characters long')
    .max(30, 'lastName must be at most 30 characters long'),

  email: z
    .string()
    .trim()
    .min(1, 'email is required')
    .email('invalid email'),

  password: z
    .string()
    .min(6, 'password must be at least 6 characters long'),

  confirmPassword: z
    .string()
    .min(6, 'confirm password must be at least 6 characters long'),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


