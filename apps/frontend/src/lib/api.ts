import axios from 'axios';

// Assume backend is running on localhost:3000
// In dev, Vite proxy could handle this, or just hardcode for now
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});
