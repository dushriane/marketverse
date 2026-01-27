import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    const { items } = req.body; // Expecting [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
    }

    try {
        let totalAmount = 0;
        const transactionItems: { productId: string; quantity: number; priceAtTime: number }[] = [];

        // 1. Calculate Total & Prepare Items
        // Note: Doing this in a loop is simple but ideally we'd use a single query or stricter locking
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) continue;
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
            }

            totalAmount += product.price * item.quantity;
            transactionItems.push({
                productId: product.id,
                quantity: item.quantity,
                priceAtTime: product.price
            });
        }

        // 2. Create Transaction in DB (Atomic)
        const transaction = await prisma.$transaction(async (tx) => {
            // Deduct stock
            for (const item of transactionItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Create record
            return await tx.transaction.create({
                data: {
                    buyerId: user!.userId,
                    totalAmount,
                    status: 'COMPLETED', // Or PENDING if implementing payment gateway
                    items: {
                        create: transactionItems
                    }
                },
                include: { items: true }
            });
        });

        res.status(201).json(transaction);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    try {
        const orders = await prisma.transaction.findMany({
            where: { buyerId: user!.userId },
            include: { 
                items: {
                    include: { product: true }
                } 
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getVendorReservations = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    try {
        const profile = await prisma.vendorProfile.findUnique({ where: { userId: user!.userId } });
        if (!profile) return res.status(403).json({ error: 'Not a vendor' });

        const items = await prisma.transactionItem.findMany({
            where: {
                product: { stall: { vendorId: profile.id } }
            },
            include: {
                product: true,
                transaction: {
                    include: { buyer: true }
                }
            },
            orderBy: { transaction: { createdAt: 'desc' }}
        });

        const reservations = items.map(item => ({
            id: item.transactionId, 
            itemId: item.id,
            customerName: item.transaction.buyer?.fullName || item.transaction.buyer?.email || 'Guest',
            // Ensure this is properly typed and available
            userId: item.transaction.buyerId, 
            productName: item.product.name,
            quantity: item.quantity,
            total: item.priceAtTime * item.quantity,
            price: item.priceAtTime,
            status: item.transaction.status, 
            createdAt: item.transaction.createdAt
        }));

        res.json(reservations);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    // This updates the whole transaction or item? 
    // To match frontend "Complete" button
    const { id } = req.params;
    const { status } = req.body;
    try {
        // Here we update the Transaction. 
        // Note: This affects all items in the transaction. 
        // In a multi-vendor cart, this is problematic, but acceptable for MVP/Mock.
        const updated = await prisma.transaction.update({
             where: { id },
             data: { status }
        });
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
