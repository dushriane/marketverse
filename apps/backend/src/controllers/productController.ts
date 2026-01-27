import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { SocketService } from '../services/socketService';
// In a real app, you'd inject this via DI container
import { Server } from 'socket.io'; 
// A bit hacky to get the socket instance, typically passed via locals or singleton
// For now, assume we just update DB and use a simpler mechanism or existing socketService singleton if exported

export const createProduct = async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    if (!user) return res.status(401).send();

    try {
        // 1. Get Vendor Profile
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId }
        });

        if (!vendorProfile) {
            return res.status(404).json({ error: 'Vendor profile not found.' });
        }

        // 2. Validate Stall Ownership (Optional but good)
        const { stallId, name, price, stock, category, meshId, positionX, positionY, positionZ } = req.body;
        
        const stall = await prisma.stall.findUnique({ where: { id: stallId } });
        if (!stall || stall.vendorId !== vendorProfile.id) {
            return res.status(403).json({ error: 'You do not own this stall.' });
        }

        // 3. Create
        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                stallId,
                meshId,
                positionX: parseFloat(positionX || 0),
                positionY: parseFloat(positionY || 0),
                positionZ: parseFloat(positionZ || 0)
            }
        });

        res.status(201).json(product);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthRequest).user;
    
    try {
        // Verify ownership
        const existing = await prisma.product.findUnique({
            where: { id },
            include: { stall: true }
        });
        
        if (!existing) return res.status(404).json({ error: 'Product not found' });
        
        // Check if user is the vendor of this stall
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user!.userId } });
        if (!vendorProfile || existing.stall.vendorId !== vendorProfile.id) {
            return res.status(403).json({ error: 'Unauthorized to edit this product' });
        }

        const updated = await prisma.product.update({
            where: { id },
            data: req.body
        });

        res.json(updated);
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthRequest).user;

    try {
        const existing = await prisma.product.findUnique({
            where: { id },
            include: { stall: true }
        });

        if (!existing) return res.status(404).json({ error: 'Product not found' });
        
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user!.userId } });
        if (!vendorProfile || existing.stall.vendorId !== vendorProfile.id) {
            return res.status(403).json({ error: 'Unauthorized to delete this product' });
        }

        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};
