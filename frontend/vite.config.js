// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Crucial for Network IP access
    proxy: {
      // Forward all core API routes to the backend
      '^/(auth|user|admin|api)': {
        target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    minify: 'terser', // Higher compression for production
    sourcemap: false,
  },
});

