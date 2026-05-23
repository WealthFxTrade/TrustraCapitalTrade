// frontend/vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    /* ================= PLUGINS ================= */
    plugins: [react()],

    /* ================= PATH ALIAS ================= */
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },

    /* ================= DEV SERVER ================= */
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,

      /**
       * DEV ONLY proxy (NOT used in production)
       * Keeps local development easy
       */
      proxy: {
        "/api": {
          target: "http://localhost:10000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },

      hmr: {
        overlay: true,
      },
    },

    /* ================= PREVIEW ================= */
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },

    /* ================= BUILD ================= */
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,

      target: "es2022",
      minify: "esbuild",

      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1600,

      sourcemap: isDev,

      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["framer-motion", "lucide-react"],
            toast: ["react-hot-toast"],
          },
        },
      },
    },

    /* ================= ENV ================= */
    envPrefix: "VITE_",

    /* ================= GLOBALS ================= */
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      global: "globalThis",
    },
  };
});
