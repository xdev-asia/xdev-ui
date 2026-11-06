import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Optional peers used only by the subpath entries; never bundled, never imported by dist/index.js.
const optionalPeers = [/^@tiptap\//, /^react-easy-crop($|\/)/];

// Library build: ESM, React external, one CSS file (dist/styles.css).
// Entries: index (core, zero deps), editor (Tiptap peers), image (react-easy-crop peer).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: { index: "src/lib.ts", editor: "src/editor/index.ts", image: "src/image/index.ts" },
      formats: ["es"],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", ...optionalPeers],
      output: { banner: '"use client";', chunkFileNames: "chunks/[name]-[hash].js" },
    },
  },
});
