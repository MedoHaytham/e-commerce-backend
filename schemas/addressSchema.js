import z from "zod";

export const addressSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title is required"),

  firstName: z
    .string()
    .trim()
    .min(1, "firstName is required"),

  lastName: z
    .string()
    .trim()
    .min(1, "lastName is required"),

  address: z
    .string()
    .trim()
    .min(5, "address must be at least 5 characters"),

  city: z
    .string()
    .trim()
    .min(1, "city is required"),

  country: z
    .string()
    .trim()
    .default("egypt"),

  phone: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "phone must be 11 digits"),
});