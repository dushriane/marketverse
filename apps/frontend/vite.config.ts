import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cast to any to avoid type mismatch issues in monorepo environment
export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 3000, // Changed from 5175 to 3000 as per user request
    host: true,
    proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
            target: 'http://localhost:5000',
            ws: true,
        }
    }
  },
  resolve: {
    alias: {
      '@marketverse/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
})
