# Runtime, Theme, State, And Actions

The generated artifact is one classic HTML document. It embeds the precompiled `StandaloneCanvas` UMD runtime and loads pinned React, ReactDOM, PropTypes, Recharts, Dagre, Lucide React, and Babel Standalone scripts.

## JSX Execution

Write application code only inside the existing block:

```html
<script type="text/babel" data-presets="react">
  /* CANVAS_APP_START */
  // JSX application
  /* CANVAS_APP_END */
</script>
```

Babel compiles this block in the browser. Use ordinary JavaScript plus JSX. Do not use TypeScript annotations, interfaces, enums, imports, exports, `require`, top-level `await`, or module syntax.

The author-facing globals are `React`, `ReactDOM`, `Babel`, and `StandaloneCanvas`. The shell also provides the `PropTypes`, `Recharts`, `dagre`, and `LucideReact` globals required by the externalized CanvasX runtime; application code should use them through `StandaloneCanvas` instead of accessing them directly.

## `CanvasProvider`

Wrap the complete artifact in one provider.

Props:

- `children`.
- `theme?: "dark" | "light" | string`, default `"dark"`.
- `storagePrefix?: string`, default `"standalone-canvas"`.
- `onAction?: (action) => void`.
- `themeOverrides?` for host-supplied palette overrides.

Use a stable artifact-specific `storagePrefix` so state from unrelated HTML files does not collide.

```jsx
<CanvasProvider theme="dark" storagePrefix="release-readiness-2026">
  <main className="canvas-page"><App /></main>
</CanvasProvider>
```

The shell may derive `theme` from `prefers-color-scheme`. The provider publishes key colors as CSS custom properties on the document root.

## `useHostTheme`

Call only inside a React component. It returns the current semantic theme. Prefer built-in components and use tokens only for custom SVG or markup.

Stable paths:

- `theme.text.primary`, `secondary`, `tertiary`, `quaternary`, `link`, `onAccent`.
- `theme.bg.editor`, `chrome`, `elevated`.
- `theme.fill.primary`, `secondary`, `tertiary`, `quaternary`.
- `theme.stroke.primary`, `secondary`, `tertiary`.
- `theme.accent.primary`, `control`.
- `theme.diff.insertedLine`, `removedLine`, `stripAdded`, `stripRemoved`.
- `theme.category.blue`, `orange`, `green`, `yellow`, `purple`, `cyan`, `pink`, `red`, `gray`, `lime`.
- `theme.kind`, `theme.tokens`, `theme.palette`.

```jsx
function LegendItem({ color, children }) {
  const theme = useHostTheme();
  return (
    <Row gap={6}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category[color] }} />
      <Text tone="secondary">{children}</Text>
    </Row>
  );
}
```

Do not hardcode hexadecimal colors, gradients, or shadows in application JSX.

Theme constants are also exported for advanced composition: `canvasPaletteDark`, `canvasPaletteLight`, `canvasTokens`, `canvasTokensLight`, `categoryPaletteDark`, `categoryPaletteLight`, `colorPalette`, and `usageColorSequence`.

## `useCanvasState`

Persistent browser state with the same tuple shape as `React.useState`:

```js
const [value, setValue] = useCanvasState(key, defaultValue);
```

- `key` must be a stable unique string within the artifact.
- `setValue` accepts a new value or `(previous) => next` updater.
- Values must be JSON-serializable.
- State is stored in browser `localStorage` under `<storagePrefix>:<key>`.
- State survives reloads in the same browser profile. It does not travel with the HTML file and may be unavailable when storage is disabled.

```jsx
function Counter() {
  const [count, setCount] = useCanvasState("count", 0);
  return <Button onClick={() => setCount((current) => current + 1)}>Count {count}</Button>;
}
```

Do not use it for immutable report source data; embed that data as ordinary constants.

## `useCanvasAction`

Returns a stable fire-and-forget `dispatch(action)` function. Every action is sent as a `standalone-canvas-action` `CustomEvent` on `window`. `CanvasProvider.onAction` receives the same action when supplied.

Supported action shapes:

```js
{ type: "openAgent", agentId: string }
{ type: "newComposerChat", userPrompt?: string }
{
  type: "openFile",
  path: string,
  selection?: {
    startLineNumber: number,
    startColumn?: number,
    endLineNumber?: number,
    endColumn?: number,
  },
}
{ type: "openUrl", url: string, target?: "_self" | "_blank" }
{ type: "copyText", text: string }
{ type: "custom", name: string, payload?: unknown }
```

The standalone artifact only dispatches intent. A containing browser page may listen and implement it:

```js
window.addEventListener("standalone-canvas-action", (event) => {
  console.log(event.detail);
});
```

When the HTML is opened directly, `openAgent`, `newComposerChat`, and `openFile` have no built-in external host to execute them. Use these only when the intended embedding host supports them. For a directly opened report, prefer ordinary `Link` for URLs and implement copying with browser APIs in explicit user click handlers when needed.

```jsx
function FileAction() {
  const dispatch = useCanvasAction();
  return <Button onClick={() => dispatch({ type: "openFile", path: "src/app.ts" })}>Open source</Button>;
}
```

## Network And Storage Contract

The only expected network access is the pinned CDN runtime scripts in the shell. Do not fetch report data or add external assets. The generated file contains the CanvasX UMD runtime and all application data; its third-party React, ReactDOM, PropTypes, Recharts, Dagre, Lucide React, and Babel runtimes load from the pinned script URLs.
