import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// In development, we rely on Vite's proxy (defined in vite.config.ts) to forward requests from /api to localhost:5000/api
// In production, this would likely be the full URL of the backend service
export const api = axios.create({
  baseURL: '/api', 
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const { logout } = useAuthStore.getState();
      logout();
      // Optionally redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
