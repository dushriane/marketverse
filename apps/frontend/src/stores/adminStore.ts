import { create } from 'zustand';
import { api } from '../lib/api';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string | null;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  createdAt: string;
}

interface AdminState {
  users: UserSummary[];
  isLoading: boolean;
  
  fetchUsers: () => Promise<void>;
  createMarket: (data: { name: string; location: string; environmentId: string }) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/users');
      set({ users: res.data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  createMarket: async (data) => {
    set({ isLoading: true });
    try {
      await api.post('/admin/markets', data);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  }
}));
