import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Assume backend is running on localhost:3000
// In dev, Vite proxy could handle this, or just hardcode for now
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  // Read token from Zustand store
  // Zustand persist stores data in localStorage under 'marketverse-auth'
  // But we can access the state directly via the hook's getState() method usually, 
  // but simpler here to just check localStorage since we know the key if we are outside a component.
  // Actually, let's use the store instance if possible.
  
  const state = useAuthStore.getState();
  if (state.user?.token) {
    config.headers.Authorization = `Bearer ${state.user.token}`;
  }
  return config;
});
