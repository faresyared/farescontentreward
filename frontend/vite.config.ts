// frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // <-- Add this whole server block
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend server's address
        changeOrigin: true,
      }
    }
  }
})