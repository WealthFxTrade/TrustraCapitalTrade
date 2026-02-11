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
    host: true,
    port: 5173, // dev server port
  },

  preview: {
    host: true,
    port: 5173, // preview (production) port
  },

  define: {
    'process.env': {},
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Moves libraries to a separate file
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Raises the limit so the warning disappears
  },
});
