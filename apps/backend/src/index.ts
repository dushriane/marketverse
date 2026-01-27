import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/marketRoutes';
import { SocketService } from './services/socketService';
import { prisma } from './config/prisma';

dotenv.config();

const app = express();
const httpServer = createServer(app);
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
app.use('/api/market', marketRoutes);

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
