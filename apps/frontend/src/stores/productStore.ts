import { create } from 'zustand';
import { Product } from '@marketverse/types';
import { api } from '../lib/api';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (vendorId: string) => Promise<void>;
  createProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string, vendorId: string) => Promise<void>;
  bulkUpdateStatus: (vendorId: string, status: 'available' | 'out_of_stock') => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async (vendorId) => {
    set({ isLoading: true });
    try {
      // Use the Vendor Dashboard private endpoint
      const res = await api.get('/vendor/products');
      set({ products: res.data });
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (product) => {
    try {
      const res = await api.post('/products', product);
      set((state) => ({ products: [...state.products, res.data] }));
    } catch (error) {
      console.error('Failed to create product', error);
      throw error;
    }
  },

  updateProduct: async (product) => {
    if (!product.id) return;
    try {
      const res = await api.put(`/products/${product.id}`, product);
      set((state) => ({
        products: state.products.map((p) => (p.id === product.id ? res.data : p)),
      }));
    } catch (error) {
      console.error('Failed to update product', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      // Refresh list or Optimistic update
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  },

  bulkUpdateStatus: async (vendorId, status) => {
    try {
      await api.post('/products/bulk-availability', { vendorId, status });
      // Optimistic update all local products
      set((state) => ({
        products: state.products.map(p => ({ ...p, status }))
      }));
    } catch (error) {
      console.error('Failed to bulk update', error);
    }
  },
}));
