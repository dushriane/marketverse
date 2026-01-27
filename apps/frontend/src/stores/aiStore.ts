import { create } from 'zustand';
import { api } from '../lib/api';

interface AIState {
  isGenerating: boolean;
  generatedDescription: string | null;
  suggestedCategories: string[];
  generatedSummary: string | null;
  trendingProducts: string[];
  
  generateDescription: (storeName: string, keywords: string) => Promise<void>;
  suggestCategories: (name: string, description: string) => Promise<void>;
  generateSummary: (vendorId: string) => Promise<void>;
  fetchTrends: (category: string) => Promise<void>;
  clearAIState: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  generatedDescription: null,
  suggestedCategories: [],
  generatedSummary: null,
  trendingProducts: [],

  generateDescription: async (storeName, keywords) => {
    set({ isGenerating: true, generatedDescription: null });
    try {
      const res = await api.post('/ai/generate-description', { storeName, keywords });
      set({ generatedDescription: res.data.description });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isGenerating: false });
    }
  },

  suggestCategories: async (name, description) => {
    set({ isGenerating: true, suggestedCategories: [] });
    try {
      const res = await api.post('/ai/suggest-categories', { name, description });
      set({ suggestedCategories: res.data.categories });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isGenerating: false });
    }
  },

  generateSummary: async (vendorId) => {
    set({ isGenerating: true, generatedSummary: null });
    try {
      const res = await axios.post(`${API_URL}/ai/summary`, { vendorId });
      set({ generatedSummary: res.data.summary });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isGenerating: false });
    }
  },

  fetchTrends: async (category) => {
    set({ isGenerating: true, trendingProducts: [] });
    try {
      const res = await axios.get(`${API_URL}/ai/trends`, { params: { category } });
      set({ trendingProducts: res.data.trends });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isGenerating: false });
    }
  },

  clearAIState: () => set({ 
    generatedDescription: null, 
    suggestedCategories: [], 
    generatedSummary: null, 
    trendingProducts: [] 
  })
}));
