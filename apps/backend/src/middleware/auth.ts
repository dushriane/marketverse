import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
     // For development/mocking, we might allow bypass or anonymous
     // return res.sendStatus(401); 
     return next(); // Allowing anonymous for now to speed up frontend testing
  }

  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
  //   if (err) return res.sendStatus(403);
  //   (req as any).user = user;
  //   next();
  // });
  next();
};

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || user.role !== role) {
            // return res.sendStatus(403);
            return next(); // Bypass for dev
        }
        next();
    }
}
