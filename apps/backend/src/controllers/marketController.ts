import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        stalls: true 
      }
    });
    
    // Map to frontend expected format
    const formatted = vendors.map((v:any) => ({
      id: v.id,
      storeName: v.storeName,
      description: v.description,
      marketLocation: "Central_Instance_1", // Mock for now
      categories: ["General"], // Mock
      productCount: 0, // Mock
      profileImage: "https://via.placeholder.com/150"
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

export const getStallLayout = async (req: Request, res: Response) => {
  const { stallId } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { stallId: stallId }
    });

    const layout = products.map((p:any) => ({
      productId: p.id,
      meshId: p.meshId,
      position: { x: p.positionX, y: p.positionY, z: p.positionZ },
      rotation: { x: 0, y: 0, z: 0 }, // Add rotation to DB later
      scale: { x: 1, y: 1, z: 1 }
    }));

    res.json({ stallId, layout });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch layout' });
  }
};
