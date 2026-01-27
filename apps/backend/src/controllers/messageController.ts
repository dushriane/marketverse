import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

interface AuthRequest extends Request {
    user?: { userId: string; role: string; }
}

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
            }
        });
        
        // Note: Socket event should be emitted here in a real app
        // e.g., io.to(receiverId).emit('newMessage', message);
        
        res.status(201).json(message);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        // Get conversation with specific user or all?
        // Let's get list of unique conversations or just all messages
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
        res.status(500).json({ error: e.message });
    }
}

export const getTopBuyers = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
        
        if (!profile) return res.status(403).json({ error: 'Not a vendor' });

        // Complex query: Find users who bought from this vendor most
        // Simplified: Return mock or simple transaction count
        // Prisma groupBy on TransactionItem -> Product -> Vendor is hard.
        // We will do a raw query or simple fetch.
        
        // Fetch all transaction items for vendor's products
        const items = await prisma.transactionItem.findMany({
            where: {
                product: { stall: { vendorId: profile.id } }
            },
            include: {
                transaction: { include: { buyer: true } }
            }
        });
        
        const buyerStats: Record<string, { count: number, total: number, user: any }> = {};
        
        items.forEach((item: any) => {
            const buyer = item.transaction.buyer;
            if (!buyer) return;
            
            if (!buyerStats[buyer.id]) {
                buyerStats[buyer.id] = { count: 0, total: 0, user: { id: buyer.id, name: buyer.fullName } };
            }
            buyerStats[buyer.id].count += 1;
            buyerStats[buyer.id].total += (item.quantity * item.priceAtTime);
        });
        
        const top = Object.values(buyerStats).sort((a,b) => b.total - a.total).slice(0, 10);
        res.json(top);

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
