import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Use standard bcrypt in production, simple hash for demo consistency with seed
const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        fullName,
        role: role || 'BUYER' // Default to Buyer if not specified
      }
    });

    // If registering as a Vendor, create an empty profile
    if (role === 'VENDOR') {
        await prisma.vendorProfile.create({
            data: {
                userId: newUser.id,
                storeName: `${fullName}'s Store`,
                description: 'New vendor store'
            }
        });
    }

    const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(201).json({ 
        message: 'User created successfully',
        user: { id: newUser.id, email: newUser.email, role: newUser.role },
        token 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ 
        message: 'Login successful',
        user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
        token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
