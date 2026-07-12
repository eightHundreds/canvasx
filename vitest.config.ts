import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@canvasx/react/host": path.resolve(root, "packages/canvas/src/standalone-host.ts"),
      "@canvasx/react": path.resolve(root, "packages/canvas/src/index.tsx"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
