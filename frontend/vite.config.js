import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use 'resolve.alias' to redirect Node-only calls to browser-safe versions
  resolve: {
    alias: {
      '@': '/src',
      'path': 'path-browserify',
    },
  },
  build: {
    // This tells Vite/Rollup that these are NOT browser modules
    rollupOptions: {
      external: [
        'node:path', 
        'node:url', 
        'node:fs', 
        '@vitejs/plugin-react'
      ],
    },
  },
  // This helps when dependencies use 'process' or Node globals
  define: {
    'process.env': {},
    'global': {},
  }
});

