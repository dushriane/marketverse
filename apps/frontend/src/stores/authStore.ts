import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  token: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'marketverse-auth',
    }
  )
);

