import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    jsxInject: 'import * as React from "react";',
    legalComments: "inline",
  },
  build: {
    lib: {
      entry: path.resolve(root, "packages/canvas/src/index.tsx"),
      name: "StandaloneCanvas",
      formats: ["umd"],
      fileName: () => "canvasx.umd.js",
    },
    outDir: "dist/umd",
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      external: ["react", "react-dom", "recharts", "@dagrejs/dagre", "lucide-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          recharts: "Recharts",
          "@dagrejs/dagre": "dagre",
          "lucide-react": "LucideReact",
        },
      },
    },
  },
});
