import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/marketRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import transactionRoutes from './routes/transactionRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';
import messageRoutes from './routes/messageRoutes';
import { SocketService } from './services/socketService';
import { prisma } from './config/prisma';
import { upload } from './middleware/upload';
import { aiService } from './ai';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Initialize Services ---
// Initialize singleton
SocketService.getInstance().init(io);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', transactionRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', require('./routes/ai').default || ((req:any, res:any, next:any) => next())); // Placeholder dynamic load or missing route handler

// --- AI Routes (Merged from direct implementation) ---
// Moved into a proper route file usually, but keeping here for context as they were inline
// Changed field name to 'file' to support generic uploads (images, 3D models)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/ai/generate-description', async (req, res) => {
    const { imageBase64, category, storeName, keywords, productName } = req.body;
    
    // Mode 1: Vendor Profile (Store Identity)
    if (storeName) {
        const desc = await aiService.generateDescription(storeName, keywords || 'quality, trusted, community');
        return res.json({ description: desc });
    }
    
    // Mode 2: Product Description
    if (productName) {
         // In a real scenario, we might pass the imageBase64 to a vision model (Gemini Pro Vision)
         // For now, we generate text based on the name and category
         const prompt = `${productName} ${category ? `(${category})` : ''} ${keywords ? keywords : ''}`;
         const desc = await aiService.generateDescription(productName, keywords || 'high quality, great value');
         return res.json({ description: desc });
    }

    res.json({ description: "Unable to generate description. Please provide a Store Name or Product Name." });
});

app.post('/api/ai/suggest-categories', async (req, res) => {
    const { name, description } = req.body;
    const categories = await aiService.suggestCategories(name, description);
    res.json({ categories });
});

// --- Health Check ---
app.get('/health', (req, res) => {

  res.json({ status: 'ok', timestamp: new Date() });
});

// --- Legacy Compability (Mock Data) / Temporary ---
// In a full migration, these would be moved to specific User/Product controllers 
// and backed by the Postgres DB via Prisma.
app.get('/api/test-db', async (req, res) => {
    try {
        const count = await prisma.user.count();
        res.json({ message: "Database connected", userCount: count });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// To restore previous endpoints, we would plug in the old routers here.
// For the purpose of this task (Technical Implementation Brief), we've established the new structure.

httpServer.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
  console.log(`Socket.IO Server ready`);
});
