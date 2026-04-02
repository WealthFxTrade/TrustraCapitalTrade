// frontend/vite.config.js - Full Unshortened
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
    host: true, // Required for Network IP access (172.20.10.x)
    proxy: {
      // Forward API calls to the backend terminal
      '/auth': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    sourcemap: false,
  },
});
