import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cast to any to avoid type mismatch issues in monorepo environment
export default defineConfig({
  plugins: [react() as any],
  server: {
    port: 5175,
  },
})
