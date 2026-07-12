import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "dist", "umd", "canvasx.umd.js");
const target = path.join(root, "skills", "canvasx", "assets", "canvasx.umd.js");

fs.copyFileSync(source, target);
console.log(`Updated ${path.relative(root, target)}`);
