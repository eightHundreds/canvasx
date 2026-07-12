import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as CanvasApi from "@canvasx/react";

const skillRoot = path.join(process.cwd(), "skills", "canvasx");
const referenceNames = ["api.md", "components.md", "data-visualization.md", "runtime.md"];
const skillSource = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const referenceSource = referenceNames
  .map((name) => fs.readFileSync(path.join(skillRoot, "references", name), "utf8"))
  .join("\n");
const runtimeManifest = JSON.parse(
  fs.readFileSync(path.join(skillRoot, "assets", "runtime-exports.json"), "utf8"),
) as string[];

describe("standalone Canvas Skill contract", () => {
  it("documents every runtime export", () => {
    expect(runtimeManifest.sort()).toEqual(Object.keys(CanvasApi).sort());
    for (const exportName of runtimeManifest) {
      expect(referenceSource, `Missing API documentation for ${exportName}`).toContain(exportName);
    }
  });

  it("keeps every direct reference linked from SKILL.md", () => {
    for (const name of referenceNames) {
      expect(skillSource).toContain(`references/${name}`);
      expect(fs.existsSync(path.join(skillRoot, "references", name))).toBe(true);
    }
  });

  it("contains no editor-specific names, paths, or protocols", () => {
    const textFiles = [
      "SKILL.md",
      "agents/openai.yaml",
      "assets/shell.html",
      "assets/runtime-exports.json",
      "scripts/create_canvas.mjs",
      "scripts/validate_canvas.mjs",
      ...referenceNames.map((name) => `references/${name}`),
    ];
    const editorBrand = ["Cur", "sor"].join("");
    const editorKey = editorBrand.toLowerCase();
    const alternateProtocol = ["vs", "code"].join("");
    const forbidden = [
      new RegExp(`\\b${editorBrand}\\b`, "i"),
      new RegExp(`\\.${editorKey}/`, "i"),
      new RegExp(`${editorKey}-agent`, "i"),
      new RegExp(`${editorKey}://`, "i"),
      new RegExp(`${alternateProtocol}://`, "i"),
      new RegExp(`/Applications/${editorBrand}`, "i"),
    ];

    for (const relativePath of textFiles) {
      const source = fs.readFileSync(path.join(skillRoot, relativePath), "utf8");
      for (const pattern of forbidden) {
        expect(source, `${relativePath} contains ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
