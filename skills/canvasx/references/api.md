# StandaloneCanvas API Index

Use this index before writing application JSX. The generated HTML provides these globals:

- `React`
- `ReactDOM`
- `Babel`
- `StandaloneCanvas`

Destructure every component and hook you use from `StandaloneCanvas`. Do not import packages.

## Reference Routing

- Read [components.md](components.md) for `Stack`, `Row`, `Grid`, typography, cards, buttons, pills, callouts, and form controls.
- Read [data-visualization.md](data-visualization.md) for `Table`, `Stat`, charts, diffs, tasks, usage bars, swatches, and `computeDAGLayout`.
- Read [runtime.md](runtime.md) for `CanvasProvider`, `useHostTheme`, `useCanvasState`, `useCanvasAction`, JSX execution, and theme constants.

## Public Surface

Layout and typography:

`Stack`, `Row`, `Grid`, `Divider`, `Spacer`, `H1`, `H2`, `H3`, `Text`, `Code`, `Link`

Surfaces and actions:

`Card`, `CardHeader`, `CardBody`, `CollapsibleSection`, `Button`, `IconButton`, `Pill`, `Callout`

Forms:

`TextInput`, `TextArea`, `Checkbox`, `Toggle`, `Select`

Data and visualization:

`Table`, `Stat`, `UsageBar`, `Swatch`, `BarChart`, `LineChart`, `PieChart`, `DiffView`, `DiffStats`, `TodoList`, `TodoListCard`, `computeDAGLayout`

Host and theme:

`CanvasProvider`, `useHostTheme`, `useCanvasState`, `useCanvasAction`, `mergeStyle`, `canvasPaletteDark`, `canvasPaletteLight`, `canvasTokens`, `canvasTokensLight`, `categoryPaletteDark`, `categoryPaletteLight`, `colorPalette`, `usageColorSequence`

## Minimal Mount

```jsx
const { CanvasProvider, H1, Stack, Text } = StandaloneCanvas;

function App() {
  return (
    <CanvasProvider theme="dark" storagePrefix="service-report">
      <main className="canvas-page">
        <Stack gap={12}>
          <H1>Service report</H1>
          <Text>Healthy</Text>
        </Stack>
      </main>
    </CanvasProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

## Common Failure Modes

- Referencing a name not listed above.
- Passing DOM events to controlled-state setters; form callbacks already receive the new value.
- Putting `H1`, `H2`, buttons, rows, or several pills inside `CardHeader`.
- Wrapping every section or an already framed `Table` in a card.
- Using a chart with empty arrays or misaligned category and series lengths.
- Calling hooks outside a React component.
- Using TypeScript syntax, imports, or npm package names in the Babel block.
