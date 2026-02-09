import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
     return res.status(401).json({ error: 'Access token required' });
  }

  // --- MOCK AUTHENTICATION START ---
  // Bypassing JWT verification for testing purposes as requested.
  // We infer the user based on the mock token provided.
  if (token === 'MOCK_TOKEN_CUSTOMER') {
      (req as AuthRequest).user = {
          userId: 'mock-customer-id',
          email: 'customer@example.com',
          role: 'BUYER' // Assuming 'BUYER' is the role for customer
      };
      return next();
  }
  
  if (token === 'MOCK_TOKEN_VENDOR') {
      (req as AuthRequest).user = {
          userId: 'mock-vendor-id',
          email: 'vendor@example.com',
          role: 'VENDOR'
      };
      return next();
  }
  // --- MOCK AUTHENTICATION END ---

  // Original Auth Logic (Commented out)
  /*
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    (req as AuthRequest).user = user;
    next();
  });
  */
  
  // Fallback for non-mock tokens if we want to retain some behavior or just fail
  // For now, fail if not one of our mock tokens, or try to interpret it.
  // Since we are "disabling" auth, let's just let it pass or fail. 
  // Given the instruction "disable... commenting related codes", I'll just skip the verify.
  // But purely skipping leaves req.user undefined.
  // So I'll default to customer if it's some other token, or fail.
  // Let's assume the frontend will send the correct mock token.
  return res.status(403).json({ error: 'Invalid or expired token (Mock)' });
};

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user || user.role !== role) {
            return res.status(403).json({ error: `Access denied. Requires ${role} role.` });
        }
        next();
    }
}
