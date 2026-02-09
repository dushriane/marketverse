import { create } from 'zustand';
import { api } from '../lib/api';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: {
      fullName: string | null;
      email: string;
  };
}

export interface BuyerStat {
    user: { id: string; name: string | null }; 
    count: number; 
    total: number;
}

interface MessageState {
  messages: Message[];
  topBuyers: BuyerStat[];
  isLoading: boolean;
  socket: Socket | null;
  
  fetchMessages: () => Promise<void>;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  fetchTopBuyers: () => Promise<void>;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  topBuyers: [],
  isLoading: false,
  socket: null,

  connectSocket: (userId: string) => {
      if (get().socket) return;
      const socket = io('http://localhost:5000');
      socket.on('connect', () => {
          console.log('Connected to socket', socket.id);
          socket.emit('join_user', userId);
      });
      socket.on('new_message', (message: Message) => {
          set(state => ({ messages: [message, ...state.messages] }));
      });
      set({ socket });
  },

  disconnectSocket: () => {
      get().socket?.disconnect();
      set({ socket: null });
  },


  fetchMessages: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/messages');
      set({ messages: res.data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const res = await api.post('/messages', { receiverId, content });
      // Optimistic or just re-fetch
      const newMessage = res.data;
      set(state => ({ messages: [newMessage, ...state.messages] })); 
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  fetchTopBuyers: async () => {
      try {
          const res = await api.get('/messages/top-buyers');
          set({ topBuyers: res.data });
      } catch (e) {
          console.error(e);
      }
  }
}));
