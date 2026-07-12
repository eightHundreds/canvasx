#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicExports = new Set(JSON.parse(fs.readFileSync(path.join(skillRoot, "assets", "runtime-exports.json"), "utf8")));

const input = process.argv[2];
if (!input) {
  console.error("Usage: validate_canvas.mjs <canvas.html>");
  process.exit(1);
}

const absolute = path.resolve(process.cwd(), input);
const source = fs.readFileSync(absolute, "utf8");
const errors = [];
const appStart = source.indexOf("CANVAS_APP_START");
const appEnd = source.indexOf("CANVAS_APP_END");
const appSource = appStart >= 0 && appEnd > appStart ? source.slice(appStart, appEnd) : "";

const required = [
  ["<!doctype html>", "HTML doctype"],
  ["cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js", "pinned React UMD"],
  ["sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z", "React integrity metadata"],
  ["cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js", "pinned ReactDOM UMD"],
  ["sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1", "ReactDOM integrity metadata"],
  ["cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js", "pinned PropTypes UMD"],
  ["sha384-/AfDwVDXNopzPvhxMPQ11y1OCpR6mVkWx47qzSwIiquvxkcMkZddEzDNtIOtfCpk", "PropTypes integrity metadata"],
  ["cdn.jsdelivr.net/npm/recharts@2.15.4/umd/Recharts.js", "pinned Recharts UMD"],
  ["sha384-8WLbYxXTeAFm5KD1lWOhUghb4T1QP+Y15d4aEGIFc6zzN2BMObhTK1u7mXiLbp8p", "Recharts integrity metadata"],
  ["cdn.jsdelivr.net/npm/@dagrejs/dagre@1.1.8/dist/dagre.min.js", "pinned Dagre UMD"],
  ["sha384-APx0Be9S9z04dTSdhLIIDbTZcU5XrIh2mdU3KlrwJ6+r/5wn/XSXNb6BBAGWZ++D", "Dagre integrity metadata"],
  ["window.react = window.React", "React compatibility alias for Lucide"],
  ["cdn.jsdelivr.net/npm/lucide-react@0.468.0/dist/umd/lucide-react.min.js", "pinned Lucide React UMD"],
  ["sha384-qFcdbwMyfX+xh/c/86ZgBLJ044k8zeF5gQSiNqUbPTRe5IkL+mhWXtW6D9CGDWz2", "Lucide React integrity metadata"],
  ["cdn.jsdelivr.net/npm/@babel/standalone@7.28.5/babel.min.js", "pinned Babel runtime"],
  ["sha384-mP9sW+eK08VvAmlxEkn9Kn6egvKFtnFEfW7/u9feUWAIoTvnYAzT4NwsskP+uWUd", "Babel integrity metadata"],
  ["integrity=\"sha384-", "CDN integrity metadata"],
  ["type=\"text/babel\"", "Babel application script"],
  ["StandaloneCanvas", "embedded Canvas runtime"],
  ["CANVAS_APP_START", "editable app start marker"],
  ["CANVAS_APP_END", "editable app end marker"],
  ["ReactDOM.createRoot", "React root mount"],
];

for (const [needle, label] of required) {
  if (!source.includes(needle)) errors.push(`Missing ${label}`);
}

if (source.includes("/*__STANDALONE_CANVAS_UMD__*/")) errors.push("Runtime placeholder was not replaced");
if (!appSource) errors.push("Editable application block is missing or malformed");
if (/\b(?:import|export)\s/m.test(appSource)) errors.push("Module syntax is not allowed");
if (/\brequire\s*\(/m.test(appSource)) errors.push("CommonJS require is not allowed in app code");
if (/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/m.test(appSource)) errors.push("Report data network requests are not allowed");
if (/React\.createElement\s*\(/m.test(appSource)) errors.push("Write readable JSX instead of React.createElement calls");
if (/(?:linear-gradient|radial-gradient|background-clip\s*:\s*text|boxShadow\s*:|box-shadow\s*:)/i.test(appSource)) errors.push("Gradients and box shadows are not allowed");
if (/["'`]#[0-9a-f]{3,8}\b/i.test(appSource)) errors.push("Use useHostTheme() tokens instead of hardcoded hex colors");
if (/\bTODO\b|Add header here|Placeholder content/i.test(appSource)) errors.push("Placeholder content is not allowed");
if (!/\bCanvasProvider\b/.test(appSource)) errors.push("Application must use CanvasProvider");
if (!/\bstoragePrefix\s*[:=]/.test(appSource)) errors.push("CanvasProvider must use an artifact-specific storagePrefix");

const destructures = [...appSource.matchAll(/\b(?:const|let|var)\s*{([\s\S]*?)}\s*=\s*StandaloneCanvas\s*;/g)];
if (destructures.length === 0) {
  errors.push("Destructure components and hooks from StandaloneCanvas");
} else {
  for (const match of destructures) {
    for (const part of match[1].split(",")) {
      const exportName = part.trim().split(/\s*:\s*/)[0];
      if (exportName && !publicExports.has(exportName)) errors.push(`Unknown StandaloneCanvas export: ${exportName}`);
    }
  }
}

if (/type=["']module["']/i.test(source)) errors.push("Module scripts are not allowed");
if ((source.match(/<script\b[^>]*\bsrc=/gi) ?? []).length !== 7) errors.push("Expected exactly seven pinned external runtime scripts");
if ((source.match(/<script\b[^>]*\bintegrity=["']sha384-/gi) ?? []).length !== 7) errors.push("Expected integrity metadata on all seven external runtime scripts");
if (/<link\b[^>]*\brel=["']stylesheet["']/i.test(source)) errors.push("External stylesheets are not allowed");
if (source.includes("node_modules/")) errors.push("References to node_modules are not allowed");
if (source.length < 30_000) errors.push("Embedded runtime appears to be missing or truncated");

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${absolute}`);
