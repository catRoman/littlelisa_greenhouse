// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      // Use the "/api" key to tell Vite that any requests starting with "/api"
      // should be proxied to "http://10.0.0.140/api".
      "/api": {
        target: "http://10.0.0.140",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
