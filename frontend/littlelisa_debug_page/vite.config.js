// vite.config.js
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Disable hash in file naming
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    minify: "esbuild",
  },
  plugins: [
    createHtmlPlugin({
      minify: true,
    }),
  ],
  server: {
    proxy: {
      // Use the "/api" key to tell Vite that any requests starting with "/api"
      // should be proxied to "http://10.0.0.140/api".
      "/api": {
        target: "http://10.0.0.140",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/ota": {
        target: "http://10.0.0.140",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ota/, "/ota"),
      },
      // "/ota": {
      //   target: "http://019dd198-8751-4f4c-ac57-55c314cd3c2d.mock.pstmn.io",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/ota/, "/ota"),
      // },
    },
  },
});
