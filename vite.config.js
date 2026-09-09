import { defineConfig } from "vite";

// Relative asset paths work both at / and at /repository-name/ on GitHub Pages.
export default defineConfig({
  base: "./",
  build: { rollupOptions: { output: { manualChunks: { three: ["three"] } } } },
});
