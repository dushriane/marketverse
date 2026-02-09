import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string; }
}


export const getAnalytics = async (req: Request, res: Response) => {
    try {
        // Mock analytics data - This was causing 404/500 if the frontend called admin/analytics expecting this here
        // If it's routed to analyticsController properly, this fallback won't hurt
        res.json({
            totalUsers: 150,
            totalSales: 54000,
            activeVendors: 12,
            dailyVisits: [120, 150, 180, 200, 190, 230, 250]
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        // Mock reports data structure
        const reports = [
            { id: 1, title: 'Monthly Sales', date: new Date().toISOString(), status: 'Ready' },
            { id: 2, title: 'User Growth', date: new Date().toISOString(), status: 'Processing' }
        ];
        res.json(reports);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

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
