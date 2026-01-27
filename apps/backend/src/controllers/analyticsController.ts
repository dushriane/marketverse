import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import fs from 'fs';

interface AuthRequest extends Request {
    user?: { userId: string; role: string; }
}

export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        
        let stats = {};

        if (role === 'VENDOR') {
            const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
            if (!profile) return res.status(404).json({ error: 'Profile not found' });

            const stalls = await prisma.stall.findMany({ where: { vendorId: profile.id }, select: { id: true, name: true } });
            const stallIds = stalls.map((s: any) => s.id);

            const products = await prisma.product.count({ where: { stallId: { in: stallIds } } });
            // Count sales via transactions items linked to products linked to stalls
            // This is complex in prisma, simplified:
            const sales = await prisma.transactionItem.count({
                where: {
                    product: { stallId: { in: stallIds } }
                }
            });
            
            stats = { products, sales, stalls: stalls.length };
        } else if (role === 'ADMIN') {
            const users = await prisma.user.count();
            const vendors = await prisma.vendorProfile.count();
            const products = await prisma.product.count();
            const transactions = await prisma.transaction.count();
            stats = { users, vendors, products, transactions };
        }

        res.json(stats);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export const downloadReport = async (req: AuthRequest, res: Response) => {
    const { format } = req.query; // pdf or csv
    const role = req.user?.role;
    // Simple implementation: List of products or users based on role
    
    try {
        let data: any[] = [];
        if (role === 'VENDOR') {
             // Get my products
             const profile = await prisma.vendorProfile.findUnique({ where: { userId: req.user?.userId } });
             if (profile) {
                data = await prisma.product.findMany({ 
                    where: { stall: { vendorId: profile.id } },
                    include: { stall: true }
                });
             }
        } else {
            // Admin: list all users
            data = await prisma.user.findMany();
        }

        if (format === 'csv') {
            const parser = new Parser();
            const csv = parser.parse(data);
            res.header('Content-Type', 'text/csv');
            res.attachment('report.csv');
            return res.send(csv);
        } else {
            // PDF
            const doc = new PDFDocument();
            res.header('Content-Type', 'application/pdf');
            res.attachment('report.pdf');
            doc.pipe(res);
            
            doc.fontSize(25).text('MarketVerse Report', 100, 100);
            doc.fontSize(12).text(`Generated for ${role} user`, 100, 150);
            doc.moveDown();
            
            data.forEach((item, i) => {
                doc.text(`${i+1}. ${JSON.stringify(item)}`);
                doc.moveDown(0.5);
            });
            
            doc.end();
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
