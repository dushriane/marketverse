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
  identifier: z.string().min(1, "Email or Phone is required"), // Replaces phoneNumber
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['BUYER', 'VENDOR']),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;


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
  meshUrl: z.string().optional().or(z.literal('')), // URL to .glb/.gltf model
  status: z.enum(['available', 'out_of_stock']).default('available'),
  viewCount: z.number().default(0),
});

export type Product = z.infer<typeof ProductSchema>;

export const GenerateDescriptionSchema = z.object({
  imageBase64: z.string().min(1, "Image is required"),
  category: z.string().optional(),
});

export const ReservationSchema = z.object({
  id: z.string().optional(),
  vendorId: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string(), 
  customerName: z.string(),
  customerPhone: z.string().optional(),
  userId: z.string().optional(), // Added for messaging
  quantity: z.number().optional(),
  total: z.number().optional(),
  status: z.enum(['pending', 'fulfilled', 'cancelled', 'COMPLETED']).default('pending'), // Added COMPLETED which is from Transaction
  createdAt: z.string().optional(),
});

export type Reservation = z.infer<typeof ReservationSchema>;

export const MessageSchema = z.object({
  id: z.string().optional(),
  vendorId: z.string(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  content: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;


