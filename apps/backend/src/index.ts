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
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Initialize Services ---
const socketService = new SocketService(io);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', transactionRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

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
