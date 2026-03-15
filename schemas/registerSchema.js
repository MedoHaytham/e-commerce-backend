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

  phone: z
    .string()
    .trim()
    .min(1, 'phone is required')
    .regex(/^\d{11}$/, 'phone must be 11 digits'),
  
  birthDate: z
    .string()
    .trim()
    .min(1, 'birthDate is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be in YYYY-MM-DD format'),
  
  gender: z
    .string()
    .trim()
    .min(1, 'gender is required')
    .regex(/^(male|female)$/, 'gender must be male or female'),
  
  country: z
    .string()
    .trim()
    .min(1, 'country is required')
    .regex(/^(egypt|saudi arabia|uae|qatar|american|british|yemen|syria|lebanon|jordan|palestine|iraq|morocco|algeria|tunisia|libya|sudan|somalia|djibouti|comoros)$/, 'country must be a valid country'),

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


