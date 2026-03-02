import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false, // Security: Prevents raw code exposure in browser tools
    rollupOptions: {
      output: {
        // Splitting heavy libraries into separate chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'ui-icons';
            if (id.includes('axios') || id.includes('react-router')) return 'vendor-core';
            return 'vendor-libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // browser-safe globals
    'global': 'window',
  }
});
