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
    },
  },
});
