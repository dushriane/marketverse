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
