import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Demo site (GitHub Pages). base comes from the Pages workflow.
export default defineConfig({
  root: "demo",
  base: process.env.DEMO_BASE ?? "/",
  plugins: [react()],
  build: { outDir: "../dist-demo", emptyOutDir: true },
});
