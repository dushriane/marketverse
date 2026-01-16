import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vendor } from '@marketverse/types';

interface AuthState {
  vendor: Vendor | null;
  setVendor: (vendor: Vendor) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      vendor: null,
      setVendor: (vendor) => set({ vendor }),
      logout: () => set({ vendor: null }),
    }),
    {
      name: 'marketverse-auth',
    }
  )
);
