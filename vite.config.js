import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { clientPort: 443 },
    cors: true,
    allowedHosts: true,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
})
