import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const virtualId = "virtual:canvas-entry";
const resolvedVirtualId = `\0${virtualId}`;

function canvasEntryPlugin(): Plugin {
  return {
    name: "canvasx-entry",
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id !== resolvedVirtualId) return;
      const requested = process.env.CANVAS_FILE || "examples/architecture.canvas.tsx";
      const absolute = path.resolve(root, requested);
      return `export { default } from ${JSON.stringify(absolute)}; export const canvasId = ${JSON.stringify(requested)};`;
    },
  };
}

export default defineConfig({
  plugins: [react(), canvasEntryPlugin()],
  resolve: {
    alias: {
      "@canvasx/react/host": path.resolve(root, "packages/canvas/src/standalone-host.ts"),
      "@canvasx/react": path.resolve(root, "packages/canvas/src/index.tsx"),
    },
  },
  server: {
    host: "127.0.0.1",
  },
});
