import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis';

interface UserSession {
  userId: string;
  role: string;
  currentStallId?: string;
}

export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join_stall', async (data: { stallId: string; userId: string; role: string }) => {
        await this.handleJoinStall(socket, data);
      });

      socket.on('leave_stall', async (data: { stallId: string }) => {
        await this.handleLeaveStall(socket, data);
      });

      socket.on('vendor_status_update', async (data: { stallId: string; status: 'online' | 'offline' }) => {
        this.io.to(`stall_${data.stallId}`).emit('vendor_presence', {
            stallId: data.stallId,
            status: data.status
        });
      });
      
      socket.on('disconnect', () => {
         console.log(`Client disconnected: ${socket.id}`);
         // cleanup logic if needed
      });
    });
  }

  private async handleJoinStall(socket: Socket, data: { stallId: string; userId: string; role: string }) {
    const room = `stall_${data.stallId}`;
    socket.join(room);
    
    // Store user presence
    await redis.sadd(`stall:${data.stallId}:users`, data.userId);
    
    // Notify others
    socket.to(room).emit('user_entered', { userId: data.userId, role: data.role });
    
    // Send current vendor status (if available in Redis)
    const isVendorOnline = await redis.get(`stall:${data.stallId}:vendor_online`);
    if (isVendorOnline === 'true') {
        socket.emit('vendor_presence', { stallId: data.stallId, status: 'online' });
    }
  }

  private async handleLeaveStall(socket: Socket, data: { stallId: string }) {
    const room = `stall_${data.stallId}`;
    socket.leave(room);
    // cleanup
  }

  // Called by REST API when a price changes
  public broadcastPriceUpdate(stallId: string, productId: string, newPrice: number) {
    this.io.to(`stall_${stallId}`).emit('price_update', {
      productId,
      newPrice,
      timestamp: new Date().toISOString()
    });
  }
}
