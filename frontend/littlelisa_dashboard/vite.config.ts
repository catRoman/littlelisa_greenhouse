import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/wikiApi": {
        target: "https://en.wikipedia.org", // Make sure this is correct
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wikiApi/, "/w"), // Ensure this rewrite matches the expected API path
      },
      // "/api": {
      //   target: "http://172.30.58.251:3000", // Make sure this is correct
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, "/api"), // Ensure this rewrite matches the expected API path
      // },
      "/api": {
        target: "http://10.0.0.53:3000", // Make sure this is correct
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"), // Ensure this rewrite matches the expected API path
      },
    },
  },
});
