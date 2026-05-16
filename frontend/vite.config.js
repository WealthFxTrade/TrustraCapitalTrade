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
    plugins: [react()],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },

    server: {
      port: 5173,
      strictPort: true,
      host: true,
      cors: false,

      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },

      hmr: {
        overlay: true,
      },
    },

    preview: {
      port: 4173,
      strictPort: true,
      host: true,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1600,
      sourcemap: isDev,
      minify: 'esbuild', // or 'terser' if you prefer

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
            toast: ['react-hot-toast'],
            // Add more as your app grows
          },
        },
      },
    },

    envPrefix: 'VITE_',

    define: {
      // Help libraries expecting Node.js globals
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
    },

    // Production Optimizations
    ...( !isDev && {
      build: {
        target: 'es2022',
        cssCodeSplit: true,
        reportCompressedSize: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ui: ['framer-motion', 'lucide-react'],
              toast: ['react-hot-toast'],
            },
          },
        },
      },
    }),
  };
});
