import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['BUYER', 'VENDOR']).default('BUYER'),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone must be provided",
});

const LoginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string(),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone must be provided",
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, fullName, role } = RegisterSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter(obj => Object.keys(obj).length > 0)
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email || undefined,
        phone: phone || undefined,
        passwordHash,
        fullName,
        role,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
      }
    });

    // If vendor, create vendor profile
    if (role === 'VENDOR') {
      await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          storeName: fullName + "'s Store",
          description: 'Welcome to my store!',
        }
      });
    }

    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // --- MOCK LOGIN START ---
    // Bypass actual authentication and return mock data based on requested role
    const { role } = req.body; // Expecting { role: 'CUSTOMER' | 'VENDOR' }

    if (role === 'VENDOR') {
        return res.json({
            token: 'MOCK_TOKEN_VENDOR',
            user: {
                id: 'mock-vendor-id',
                email: 'vendor@example.com',
                fullName: 'Mock Vendor',
                role: 'VENDOR'
            }
        });
    } else {
        // Default to Customer/Buyer
        return res.json({
            token: 'MOCK_TOKEN_CUSTOMER',
            user: {
                id: 'mock-customer-id',
                email: 'customer@example.com',
                fullName: 'Mock Customer',
                role: 'BUYER' // Using BUYER as it aligns with the schema
            }
        });
    }
    // --- MOCK LOGIN END ---

    /*
    const { email, phone, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter(obj => Object.keys(obj).length > 0)
      },
      include: {
        vendorProfile: true,
      }
    });
    */

    /*
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
    */
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
        vendorProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};