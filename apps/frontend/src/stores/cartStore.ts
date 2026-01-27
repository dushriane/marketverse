import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderHistoryItem {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
        id: string;
        quantity: number;
        priceAtTime: number;
        product: { name: string; images: string[] };
    }[];
}

interface CartState {
  items: CartItem[];
  orderHistory: OrderHistoryItem[];
  isLoading: boolean;

  addToCart: (product: { id: string; name: string; price: number; images?: string[] }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  checkout: () => Promise<void>;
  fetchOrderHistory: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderHistory: [],
      isLoading: false,

      addToCart: (product, quantity = 1) => {
        const currentItems = get().items;
        const existing = currentItems.find(i => i.productId === product.id);
        
        if (existing) {
          set({
            items: currentItems.map(i => 
              i.productId === product.id 
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          });
        } else {
          set({
            items: [...currentItems, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.images?.[0]
            }]
          });
        }
      },

      removeFromCart: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) });
      },

      clearCart: () => set({ items: [] }),

      checkout: async () => {
        const { items } = get();
        if (items.length === 0) return;

        set({ isLoading: true });
        try {
          const payload = {
              items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
          };
          await api.post('/orders', payload);
          set({ items: [] });
          // Refresh history
          get().fetchOrderHistory();
        } catch (e) {
          console.error(e);
          throw e; // Let UI handle error
        } finally {
          set({ isLoading: false });
        }
      },

      fetchOrderHistory: async () => {
          set({ isLoading: true });
          try {
              const res = await api.get('/orders/history');
              set({ orderHistory: res.data });
          } catch (e) {
              console.error(e);
          } finally {
              set({ isLoading: false });
          }
      }
    }),
    {
      name: 'marketverse-cart',
      partialize: (state) => ({ items: state.items }), // Persist cart only
    }
  )
);
