import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cast to any to avoid type mismatch issues in monorepo environment
export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 5175, 
    host: true,
    proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
            target: 'http://localhost:3000',
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
