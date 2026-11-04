import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Library build: ESM, React external, one CSS file (dist/styles.css).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: "src/lib.ts",
      formats: ["es"],
      fileName: () => "index.js",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { banner: '"use client";' },
    },
  },
});
