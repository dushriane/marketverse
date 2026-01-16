import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cast to any to avoid type mismatch issues in monorepo environment
export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 5175,
    host: true,
  },
  resolve: {
    alias: {
      '@marketverse/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
    },
  },
})
