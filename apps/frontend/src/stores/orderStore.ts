import { create } from 'zustand';
import { Reservation, Message } from '@marketverse/types';
import { api } from '../lib/api';

interface OrderState {
  reservations: Reservation[];
  messages: Message[];
  analytics: { name: string; views: number }[];
  isLoading: boolean;
  
  fetchReservations: (vendorId: string) => Promise<void>;
  updateReservationStatus: (id: string, status: 'fulfilled' | 'cancelled') => Promise<void>;
  
  fetchMessages: (vendorId: string) => Promise<void>;
  
  fetchAnalytics: (vendorId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  reservations: [],
  messages: [],
  analytics: [],
  isLoading: false,

  fetchReservations: async (vendorId) => {
    set({ isLoading: true });
    try {
      // Changed to use the new route that derives vendor from token
      const res = await api.get(`/orders/vendor`);
      set({ reservations: res.data });
    } catch (e) { console.error(e); }
    finally { set({ isLoading: false }); }
  },

  updateReservationStatus: async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...r, status } : r)
      }));
    } catch (e) { console.error(e); }
  },

  fetchMessages: async (vendorId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/vendors/${vendorId}/messages`);
      set({ messages: res.data });
    } catch (e) { console.error(e); }
    finally { set({ isLoading: false }); }
  },

  fetchAnalytics: async (vendorId) => {
    try {
      const res = await api.get(`/vendors/${vendorId}/analytics`);
      set({ analytics: res.data });
    } catch (e) { console.error(e); }
  }
}));
