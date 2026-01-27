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
