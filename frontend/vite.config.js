import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Allows Vite to switch to 5174 if 5173 is busy
    proxy: {
      '/api': {
        // HANDSHAKE: Mapping to your local Node server on 10000
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
        // Ensures /api/login in frontend hits /api/login in backend
        rewrite: (path) => path.replace(/^\/api/, '/api'), 
      },
    },
  },
  resolve: {
    alias: {
      // Allows using '@/' for cleaner imports in your components
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimizes build for production terminal performance
    minify: 'terser',
  },
});

