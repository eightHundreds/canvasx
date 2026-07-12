import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
  it("ships a neutral scaffold without report demo content", () => {
    const shell = fs.readFileSync(path.join(skillRoot, "assets", "shell.html"), "utf8");
    expect(shell).not.toContain("weeklyTraffic");
    expect(shell).not.toContain("Operations overview");
    expect(shell).not.toContain("Live report");
  });

  it("distinguishes module syntax from import and export in visible copy", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "canvasx-validator-"));
    const output = path.join(tempRoot, "report.html");
    const create = spawnSync("node", [path.join(skillRoot, "scripts", "create_canvas.mjs"), output], {
      encoding: "utf8",
    });
    expect(create.status, create.stderr).toBe(0);

    const generated = fs.readFileSync(output, "utf8");
    const visibleCopy = generated.replace(
      "function CanvasApp() {",
      'const command = "iskills import -g"; // explain export syntax\n\n      function CanvasApp() {',
    ).replace(
      '<main className="canvas-page" />',
      '<main className="canvas-page">Use iskills import -g, then export the result: {command}</main>',
    );
    fs.writeFileSync(output, visibleCopy);
    const valid = spawnSync("node", [path.join(skillRoot, "scripts", "validate_canvas.mjs"), output], {
      encoding: "utf8",
    });
    expect(valid.status, valid.stderr).toBe(0);

    const moduleSource = visibleCopy.replace(
      "const {\n        CanvasProvider,",
      'import value from "./module.js";\n      const {\n        CanvasProvider,',
    );
    fs.writeFileSync(output, moduleSource);
    const invalid = spawnSync("node", [path.join(skillRoot, "scripts", "validate_canvas.mjs"), output], {
      encoding: "utf8",
    });
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toMatch(/Module syntax is not allowed \(line \d+: import value/);

    const commonJsSource = visibleCopy.replace(
      "const {\n        CanvasProvider,",
      'const value = require("./module.js");\n      const {\n        CanvasProvider,',
    );
    fs.writeFileSync(output, commonJsSource);
    const commonJs = spawnSync("node", [path.join(skillRoot, "scripts", "validate_canvas.mjs"), output], {
      encoding: "utf8",
    });
    expect(commonJs.status).toBe(1);
    expect(commonJs.stderr).toMatch(/CommonJS require is not allowed.*\(line \d+: const value = require/);

    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

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
      "assets/vendor/BABEL-PARSER-LICENSE",
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
