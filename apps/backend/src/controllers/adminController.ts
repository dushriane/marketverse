import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string; }
}

export const createMarket = async (req: AuthRequest, res: Response) => {
    try {
        const { name, location, environmentId } = req.body;
        const market = await prisma.market.create({
            data: { name, location, environmentId }
        });
        res.status(201).json(market);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, fullName: true, createdAt: true }
        });
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
