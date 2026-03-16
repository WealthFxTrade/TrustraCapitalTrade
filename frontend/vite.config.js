import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util',
    },
  },

  server: {
    port: 5173,
    host: '127.0.0.1',

    watch: {
      usePolling: true,
    },

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:10000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },

  define: {
    global: 'window',
  },
});
