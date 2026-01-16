import { z } from 'zod';

// Vendor Schema Definition
export const VendorSchema = z.object({
  id: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  marketLocation: z.string().min(3, "Location is required"),
  storeName: z.string().optional(),
  description: z.string().optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  operatingHours: z.string().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
});

export type Vendor = z.infer<typeof VendorSchema>;

export const LoginSchema = z.object({
  phoneNumber: z.string().min(10),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const ProductCategory = z.enum([
  'Vegetables',
  'Fruits',
  'Crafts',
  'Clothing',
  'Electronics',
  'Services',
  'Other'
]);

export const ProductSchema = z.object({
  id: z.string().optional(),
  vendorId: z.string(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0),
  isNegotiable: z.boolean().default(false),
  category: ProductCategory,
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['available', 'out_of_stock']).default('available'),
});

export type Product = z.infer<typeof ProductSchema>;

export const GenerateDescriptionSchema = z.object({
  imageBase64: z.string().min(1, "Image is required"),
  category: z.string().optional(),
});

