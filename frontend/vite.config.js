import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/bundle-analysis.html', // output file
      open: true,                              // automatically open report
      gzipSize: true,                          // show gzipped sizes
      brotliSize: true,                        // show brotli sizes
    }),
  ],
  base: '/', // Ensure correct SPA routing (e.g., Vercel)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // shortcut for imports
    },
  },
  build: {
    outDir: 'dist',      // production build folder
    assetsDir: 'assets', // assets folder inside dist
    chunkSizeWarningLimit: 1000, // raise warning limit (default 500 kB)
    rollupOptions: {
      output: {
        // Split vendor code for caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
