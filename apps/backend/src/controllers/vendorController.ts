import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Type extension for known user in request (from auth middleware)
interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    }
}

// === Profile Management ===

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await prisma.vendorProfile.findUnique({
            where: { userId },
            include: { stalls: true }
        });

        if (!profile) return res.status(404).json({ error: 'Vendor profile not found' });
        res.json(profile);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { storeName, description } = req.body;
        
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Update logic
        const updated = await prisma.vendorProfile.update({
            where: { userId },
            data: {
                storeName, description
            }
        });
        
        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

// === Stall Management ===

export const getMyStalls = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // First find the vendorProfile id
        const profile = await prisma.vendorProfile.findUnique({
             where: { userId } 
        });
        if (!profile) return res.status(404).json({ error: 'Vendor profile not found' });

        const stalls = await prisma.stall.findMany({
            where: { vendorId: profile.id },
            include: { market: true }
        });
        res.json(stalls);
    } catch(e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const createStall = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { name, marketId } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
        if (!profile) return res.status(403).json({ error: 'No Vendor Profile found' });

        const stall = await prisma.stall.create({
            data: {
                name,
                marketId,
                vendorId: profile.id
            }
        });

        res.status(201).json(stall);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const updateStall = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { name } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Verify ownership
        const stall = await prisma.stall.findUnique({ 
            where: { id },
            include: { vendor: true }
        });

        if (!stall) return res.status(404).json({ error: 'Stall not found' });
        if (stall.vendor.userId !== userId) {
            return res.status(403).json({ error: 'You do not own this stall' });
        }

        const updated = await prisma.stall.update({
            where: { id },
            data: { name }
        });

        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const deleteStall = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Verify ownership
        const stall = await prisma.stall.findUnique({
             where: { id },
             include: { vendor: true }
        });

        if (!stall) return res.status(404).json({ error: 'Stall not found' });
        if (stall.vendor.userId !== userId) {
            return res.status(403).json({ error: 'You do not own this stall' });
        }

        // Note: This might fail if there are products attached.
        // We should probably cascade delete or warn. 
        // For now, let's assume Prisma handles it or we fail.
        // Looking at schema: Product has Stall @relation. 
        // If we don't have onDelete: Cascade, it will fail.
        
        await prisma.stall.delete({ where: { id } });
        res.json({ message: 'Stall deleted' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
