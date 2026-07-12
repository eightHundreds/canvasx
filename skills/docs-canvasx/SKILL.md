---
name: docs-canvasx
description: Turn architecture notes, API references, design documents, RFCs, runbooks, codebase walkthroughs, or Markdown documentation into a polished navigable standalone HTML canvas. Use when the user asks for a docs canvas, documentation overview, architecture walkthrough, API reference page, interactive technical documentation, or a structured document that is easier to scan than flat Markdown.
---

# Docs CanvasX

Render technical documentation as one navigable HTML file using the separately installed `canvasx` Skill.

## Resolve CanvasX

1. Locate the installed `canvasx` Skill. Check a sibling `../canvasx/SKILL.md` relative to this file first, then the active agent's normal Skill installation roots.
2. Read the entire `canvasx/SKILL.md` and follow its generation, component, design, validation, and delivery requirements.
3. Read the CanvasX references it routes to before selecting components or props.

If `canvasx` is unavailable, stop and tell the user to install it. Do not read editor-specific files, use an editor-specific Canvas SDK, install npm packages, copy another runtime, or replace CanvasX with an improvised runtime.

## Gather Evidence

Accept source material from Markdown files, repository code, an inline outline, or URLs the user supplied. Inspect the actual sources before drafting.

- Preserve the source's facts, terminology, constraints, and uncertainty.
- Record useful source files, headings, symbols, URLs, and line references while reading.
- Distinguish verified behavior from recommendations or inference.
- Ask for missing material only when the requested document cannot be responsibly produced without it.

## Design The Information Architecture

Choose sections for the material rather than forcing every document into one template. Most documentation canvases should include:

1. An overview that states purpose, scope, audience, and the main takeaway.
2. A compact table of contents with working anchor links.
3. Body sections organized around the reader's tasks or questions.
4. References that link back to source material.

Add only structures that improve comprehension: architecture or sequence diagrams, API tables, decision matrices, callouts, examples, gotchas, a glossary, or a worked flow.

For long documents, keep navigation reachable with a sticky unframed sidebar on wide screens and a compact wrapping navigation row on narrow screens. Every navigation item must target a unique section `id`. Account for sticky header offset with `scrollMarginTop`.

## Match Representation To Content

- Use prose for rationale and concepts, code blocks for exact syntax, and tables for exact field or option comparison.
- Use DAGs for dependency or ownership structure and simple inline SVG for sequence or flow relationships not covered by a CanvasX component.
- Use callouts only for information with real semantic weight such as risk, warning, compatibility, or an invariant.
- Keep code examples small, internally consistent, and source-accurate. Do not invent APIs.
- Put file and URL references near the claims they support, then collect them in the references section.
- Prefer task-oriented headings such as "Authenticate requests" over vague headings such as "Details".

## Author With CanvasX

Use the CanvasX generator to create the output, then replace only its application block as directed by `$canvasx`.

- Produce exactly one browser-openable `.html` file.
- Use CanvasX components before raw HTML and use the CanvasX theme tokens for custom styles and SVG.
- Keep the document readable without interaction; interaction should improve navigation or exploration, not hide essential content.
- Use persistent state only for useful reader preferences such as selected view or expanded optional detail.
- Keep the overview concise and let the first viewport reveal the beginning of the document body.
- Avoid nested cards, a card per paragraph, decorative dashboards, fake metrics, unsupported claims, and empty sections.
- Do not add instructions about CanvasX, Babel, npm, the component library, or how the artifact was generated to the visible document.

## Verify

Run the CanvasX validator and perform every browser inspection required by `$canvasx`. Also verify documentation-specific behavior:

1. Every table-of-contents link lands on the correct section.
2. Sticky navigation does not cover headings.
3. Code blocks, tables, diagrams, and long identifiers remain readable at desktop and narrow mobile widths.
4. Source references are accurate and actionable.
5. The document has no fabricated facts, placeholder copy, broken links, or sections that merely repeat the overview.

Deliver the single HTML file according to the CanvasX delivery instructions.
