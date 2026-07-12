#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellPath = path.join(skillRoot, "assets", "shell.html");
const runtimePath = path.join(skillRoot, "assets", "canvasx.umd.js");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const args = process.argv.slice(2);
let output;
let title = "CanvasX";
let force = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--title") {
    title = args[index + 1] ?? fail("--title requires a value");
    index += 1;
  } else if (arg === "--force") {
    force = true;
  } else if (!output) {
    output = arg;
  } else {
    fail(`Unexpected argument: ${arg}`);
  }
}

if (!output) fail("Usage: create_canvas.mjs <output.html> [--title <title>] [--force]");
if (path.extname(output).toLowerCase() !== ".html") fail("Output path must end in .html");

const absoluteOutput = path.resolve(process.cwd(), output);
if (fs.existsSync(absoluteOutput) && !force) fail(`Refusing to overwrite existing file: ${absoluteOutput}`);

const shell = fs.readFileSync(shellPath, "utf8");
const runtime = fs.readFileSync(runtimePath, "utf8").replace(/<\/script/gi, "<\\/script");
const storageKey = path.basename(output, path.extname(output)).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();

if (!shell.includes("/*__STANDALONE_CANVAS_UMD__*/")) fail("Runtime placeholder is missing from shell.html");

const html = shell
  .replace("__CANVAS_TITLE__", escapeHtml(title))
  .replace("__CANVAS_STORAGE_KEY__", storageKey || "canvas")
  .replace("/*__STANDALONE_CANVAS_UMD__*/", () => runtime);

fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
fs.writeFileSync(absoluteOutput, html);
console.log(`Created ${absoluteOutput}`);
