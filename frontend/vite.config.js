import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://trustracapitalfx-d8w7.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
