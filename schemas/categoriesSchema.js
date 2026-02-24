import z from "zod";

export const categoriesSchema = z.object({
  name: z.string().min(1, 'name is required').max(30, 'name must be at most 30 characters long'),
  slug: z.string().min(1, 'slug is required').max(30, 'slug must be at most 30 characters long'),
});
