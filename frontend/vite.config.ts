import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5050,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        secure: false,
        changeOrigin: true
      }
    },
  },
  plugins: [
    react(),
    TanStackRouterVite()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server": path.resolve(__dirname, "../server"),
    },
  },
})
