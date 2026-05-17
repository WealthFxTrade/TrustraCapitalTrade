// frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    /**
     * ============================================
     * PLUGINS
     * ============================================
     */
    plugins: [react()],

    /**
     * ============================================
     * PATH ALIASES
     * ============================================
     */
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    /**
     * ============================================
     * DEVELOPMENT SERVER
     * ============================================
     */
    server: {
      host: '0.0.0.0',

      port: 5173,

      strictPort: true,

      cors: false,

      /**
       * ============================================
       * API PROXY
       * ============================================
       * Frontend:
       *   /api/auth/login
       *
       * Backend:
       *   http://localhost:10000/api/auth/login
       * ============================================
       */
      proxy: {
        '/api': {
          target: 'http://localhost:10000',

          changeOrigin: true,

          secure: false,

          ws: true,
        },
      },

      /**
       * ============================================
       * HOT MODULE RELOAD
       * ============================================
       */
      hmr: {
        overlay: true,
      },
    },

    /**
     * ============================================
     * PREVIEW SERVER
     * ============================================
     */
    preview: {
      host: '0.0.0.0',

      port: 4173,

      strictPort: true,
    },

    /**
     * ============================================
     * BUILD CONFIGURATION
     * ============================================
     */
    build: {
      /**
       * Output
       */
      outDir: 'dist',

      assetsDir: 'assets',

      emptyOutDir: true,

      /**
       * Optimization
       */
      target: 'es2022',

      minify: 'esbuild',

      cssCodeSplit: true,

      reportCompressedSize: false,

      chunkSizeWarningLimit: 1600,

      /**
       * Sourcemaps
       */
      sourcemap: isDev,

      /**
       * Rollup Optimization
       */
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
            ],

            ui: [
              'framer-motion',
              'lucide-react',
            ],

            toast: [
              'react-hot-toast',
            ],
          },
        },
      },
    },

    /**
     * ============================================
     * ENVIRONMENT VARIABLES
     * ============================================
     */
    envPrefix: 'VITE_',

    /**
     * ============================================
     * GLOBAL DEFINITIONS
     * ============================================
     */
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),

      global: 'globalThis',
    },
  };
});
