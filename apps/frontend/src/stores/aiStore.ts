import { create } from 'zustand';
import { api } from '../lib/api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 
interface AIState {
  isGenerating: boolean;
  generatedDescription: string | null;
  suggestedCategories: string[];
  generatedSummary: string | null;
  trendingProducts: string[];
  
  generateDescription: (name: string, context: string) => Promise<void>;
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

  generateDescription: async (name, context) => {
    set({ isGenerating: true, generatedDescription: null });
    try {
        // Just pass as 'storeName' and 'keywords' to match Backend expectation for now,
        // or update backend to accept 'name' and 'context'. 
        // Backend expects 'storeName' OR 'productName'.
        // Let's modify the payload logic here to be dynamic if possible, but 
        // since we can't change the Component call sites easily in this single edit:
        // We will assume if context is "product", we send productName.
        
        // Actually simplest is to send BOTH as optional fields on backend and just map accordingly here.
        // But the backend `index.ts` checks: `if (storeName) ... else if (productName) ...`
        
        // Hack: The Profile component calls with (storeName, "keywords").
        // The Product component doesn't call this store action yet in my updated code? 
        // Wait, ProductForm.tsx CALLS `api.post` DIRECTLY! 
        // So this store action is ONLY used by Profile.tsx.
        // Thus, keeping `storeName` key is Safe.
        
      const res = await api.post('/ai/generate-description', { storeName: name, keywords: context });
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
