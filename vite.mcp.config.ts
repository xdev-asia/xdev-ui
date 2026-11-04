import { defineConfig } from "vite";

// MCP server build: one self-contained Node file (SDK + zod bundled), so the
// package gains a bin without adding runtime dependencies for UI consumers.
export default defineConfig({
  build: {
    ssr: "src/mcp/server.ts",
    outDir: "dist",
    emptyOutDir: false,
    target: "node24",
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: { entryFileNames: "mcp.js", format: "es", banner: "#!/usr/bin/env node" },
    },
  },
  ssr: { noExternal: true, target: "node" },
});
