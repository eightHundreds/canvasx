---
name: canvasx
description: Create or edit a polished interactive report, dashboard, architecture view, audit, timeline, chart, table, or documentation canvas as one browser-openable HTML file. Use when the deliverable should be a standalone visual artifact and must run without npm installation, a build step, an application framework, or an editor-specific runtime.
---

# CanvasX

Create exactly one `.html` file that opens as a standalone visual artifact in a modern browser. Write JSX in its Babel application block and compose the embedded `StandaloneCanvas` UMD components.

## Workflow

### 1. Confirm The Deliverable

Use a canvas when the user benefits from opening the output separately from chat: analytical reports, audits, architecture reviews, structured findings, comparison tables, dashboards, diagrams, or interactive documentation.

Do not substitute a canvas for a requested deliverable in another tool, a code fix, a drafted message, targeted debugging, or a short factual answer.

### 2. Inspect The API

Read [references/api.md](references/api.md) before authoring. It routes to the complete references below:

- Read [references/components.md](references/components.md) for layout, typography, surfaces, actions, and form controls.
- Read [references/data-visualization.md](references/data-visualization.md) for tables, stats, charts, diffs, tasks, usage bars, swatches, and DAG layouts.
- Read [references/runtime.md](references/runtime.md) for globals, JSX execution, theme tokens, persistent state, and host actions.

Read the relevant reference when exact props, defaults, composition rules, or hook signatures matter. Never guess an export or prop.

### 3. Create The File

1. Treat the directory containing this `SKILL.md` as `<skill-dir>`.
2. Run `node <skill-dir>/scripts/create_canvas.mjs <absolute-output.html> --title "<title>"`.
3. Replace the entire contents between `CANVAS_APP_START` and `CANVAS_APP_END`. Do not preserve or partially edit the generated scaffold.
4. Include an equivalent top-level `CanvasProvider` with a stable artifact-specific `storagePrefix` in the replacement block.

The generator uses only Node built-ins. Do not run `npm install`, `pnpm install`, a bundler, or a development server.

### 4. Author The Canvas

Follow these file rules:

- Keep exactly one HTML file. Do not create helper scripts, stylesheets, data files, or local modules.
- Keep the embedded CanvasX UMD and all pinned third-party runtime script tags unchanged.
- Write readable JSX inside the existing `type="text/babel"` script.
- Read components from the global `StandaloneCanvas` object.
- Do not use TypeScript syntax, `import`, `export`, `require`, or module scripts.
- Embed all report data and behavior inline. Do not call `fetch`, `XMLHttpRequest`, `WebSocket`, or load report data from the network.
- Use the built-in components before raw HTML. Use raw SVG when a built-in view does not cover the visual.

Never render empty states. Omit a section, chart, table, or component when it has no useful data. Do not emit placeholder copy, TODOs, empty arrays, zeroed charts, or empty frames. If the entire artifact lacks source data, ask for the missing data instead of creating it.

Label every plot and exact-data view so it stands alone:

- Give it a specific metric or subject title.
- Show units and time/category meaning in visible labels or nearby copy.
- Show a legend for multiple series with source-accurate names.
- Add a compact source and time-range caption when interpretation depends on them.
- Disclose transformations such as mean, p95, normalization, or smoothing.

### 5. Compose Deliberately

- Lead with the conclusion, primary status, or key metric.
- Give primary content more space and stronger hierarchy than supporting details.
- Use a small number of full-width sections and varied composition, not a uniform stack of boxes.
- Use `Grid` for responsive columns, `Stack` for vertical structure, and `Row` for local alignment.
- Use cards only for labeled, self-contained entities or framed controls. Do not nest cards.
- Prefer charts for trends, tables for exact comparison, callouts for risks, and SVG plus `computeDAGLayout` for structure.
- Keep headings compact, spacing consistent, and long text safely wrapped.

Use `useHostTheme()` tokens for custom SVG and inline colors. Do not hardcode hex colors in application JSX.

Avoid these quality failures:

- Gradients or text clipped to gradients.
- Decorative emojis.
- Box shadows.
- A wall of identical cards.
- Rainbow coloring without semantic purpose.
- Text larger than the built-in `H1` or bold display text inside `CardHeader`.
- Decorative borders on every element.
- Headings or multiple controls inside `CardHeader`.

### 6. Validate And Inspect

1. Run `node <skill-dir>/scripts/validate_canvas.mjs <absolute-output.html>`.
2. Open the HTML directly in a browser with network access.
3. Inspect desktop and narrow mobile widths.
4. Exercise controls and hover states.
5. Confirm the console has no errors and all charts contain rendered SVG content.

Before delivery, check:

1. Does one thing clearly stand out as the primary result?
2. Is the composition varied rather than a single column of uniform blocks?
3. Are all visible plots self-describing?
4. Are empty states and forbidden visual patterns absent?
5. Does the page avoid horizontal overflow at desktop and mobile widths?

## Delivery

Deliver one HTML file and no generated support files. Include a clickable link to the HTML using its full absolute path. State that it requires network access for its pinned CDN runtime files, but requires no package installation, build step, development server, or editor runtime.
