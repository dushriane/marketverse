import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { SocketService } from '../services/socketService';

interface AuthRequest extends Request {
    user?: { userId: string; role: string; }
}

export const getTopBuyers = async (req: AuthRequest, res: Response) => {
    // Mock Data for Vendor Dashboard
    const topBuyers = [
        { id: '1', name: 'Alice Smith', totalSpent: 500, avatar: 'https://via.placeholder.com/40' },
        { id: '2', name: 'Bob Jones', totalSpent: 350, avatar: 'https://via.placeholder.com/40' },
        { id: '3', name: 'Charlie Day', totalSpent: 120, avatar: 'https://via.placeholder.com/40' }
    ];
    res.json(topBuyers);
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user?.userId;
        const { receiverId, content } = req.body;

        if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            },
            include: { sender: { select: { fullName: true, email: true } } }
        });
        
        // Emit real-time event
        SocketService.getInstance().emitToUser(receiverId, 'new_message', message);
        
        res.status(201).json(message);
    } catch (e: any) {
        console.error("Error sending message:", e);
        res.status(500).json({ error: e.message });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        
        if (!userId) {
             return res.status(401).json({ error: 'Unauthorized' });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: { sender: { select: { fullName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (e: any) {
        console.error("Error getting messages:", e);
        res.status(500).json({ error: e.message });
    }
};