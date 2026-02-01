import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react({
        // Optional: enable React Compiler if using React 19+ later (experimental in 2026)
        // babel: { plugins: [['babel-plugin-react-compiler']] },
      }),
    ],
    build: {
      minify: 'esbuild',              // fast & good enough (default)
      sourcemap: isProduction ? false : 'hidden', // disable in prod or use 'hidden' for errors
      chunkSizeWarningLimit: 800,     // increase if you have big chunks (e.g. heavy libs)
      rollupOptions: {
        output: {
          // Better chunk splitting for caching (vendor, react, etc.)
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@tanstack/react-query') || id.includes('axios')) {
                return 'data-fetching';
              }
              if (id.includes('react-router-dom')) {
                return 'routing';
              }
              return 'vendor';
            }
          },
        },
      },
      target: 'es2022',               // modern target – smaller bundles
      cssCodeSplit: true,
    },
    // Optional: better dev experience
    optimizeDeps: {
      include: ['@tanstack/react-query', 'axios'],
    },
  };
});
