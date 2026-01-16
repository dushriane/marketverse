import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface MarketVendor {
  id: string;
  storeName: string;
  description?: string;
  marketLocation: string;
  categories: string[];
  productCount: number;
  profileImage?: string;
}

interface MarketState {
  vendors: MarketVendor[];
  filteredVendors: MarketVendor[];
  isLoading: boolean;
  viewMode: '3D' | '2D';
  searchQuery: string;
  selectedCategory: string | 'All';
  selectedVendorId: string | null;

  fetchMarketData: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setViewMode: (mode: '3D' | '2D') => void;
  selectVendor: (id: string | null) => void;
  applyFilters: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  vendors: [],
  filteredVendors: [],
  isLoading: false,
  viewMode: '3D',
  searchQuery: '',
  selectedCategory: 'All',
  selectedVendorId: null,

  fetchMarketData: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/market/vendors`);
      set({ vendors: res.data, filteredVendors: res.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch market data', error);
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  selectVendor: (id) => set({ selectedVendorId: id }),

  // internal helper, not exposed in interface but used by setters
  applyFilters: () => {
    const { vendors, searchQuery, selectedCategory } = get();
    const lowerQuery = searchQuery.toLowerCase();
    
    const filtered = vendors.filter(v => {
      const matchesSearch = v.storeName.toLowerCase().includes(lowerQuery) || 
                            v.description?.toLowerCase().includes(lowerQuery);
      const matchesCategory = selectedCategory === 'All' || v.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });

    set({ filteredVendors: filtered });
  }
}));
