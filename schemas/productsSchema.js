import z from "zod";

export const productsSchema = z.object({
  title: z.string().min(1, 'title is required').max(200, 'title must be at most 200 characters long'),
  description: z.string().min(1, 'description is required').max(800, 'description must be at most 800 characters long'),
  category: z.string().min(1, 'category is required'),
  price: z.number().min(1, 'price is required'),
  rating: z.number().min(0).max(5),
  stock: z.number().min(0, 'stock must be at least 0'),
  brand: z.string().min(1, 'brand is required'),
  availabilityStatus: z.enum(["In Stock", "Out of Stock"]).default("In Stock"),
  images: z.array(z.string()).min(1, 'image is required'),
});

