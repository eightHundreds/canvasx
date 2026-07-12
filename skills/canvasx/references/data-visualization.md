# Data And Visualization

This reference covers exact data, metrics, charts, diffs, tasks, usage, categorical color, and DAG geometry.

## Contents

- Tables And Metrics
- Charts
- Diffs
- Tasks And Disclosure
- Usage And Color
- DAG Layout

## Tables And Metrics

### `Table`

Use for exact comparison. It has its own frame by default, so normally place it directly below a heading rather than inside a card.

Props:

- `headers: ReactNode[]` fixes the number and order of columns.
- `rows: ReactNode[][]` supplies cells in header order.
- `columnAlign?: Array<"left" | "center" | "right" | undefined>`.
- `rowTone?: Array<"success" | "danger" | "warning" | "info" | "neutral" | undefined>` adds a semantic marker to the first cell.
- `framed?: boolean`, default `true`.
- `striped?: boolean`.
- `stickyHeader?: boolean`.
- `emptyMessage?`, `style?`.

Do not render an empty table. Omit the section instead. Use a card only when the table belongs to a named entity requiring its own header.

```jsx
<Stack gap={8}>
  <H2>Service latency</H2>
  <Table
    headers={["Service", "Status", "P95 latency"]}
    rows={[
      ["Gateway", "Healthy", "122 ms"],
      ["API", "At risk", "284 ms"],
    ]}
    columnAlign={["left", "left", "right"]}
    rowTone={["success", "warning"]}
    striped
  />
  <Text size="small" tone="tertiary">Source: edge telemetry · 1-7 July 2026</Text>
</Stack>
```

### `Stat`

Use for one prominent value and its compact label.

Props: `value: ReactNode`, `label: string`, `tone?: "success" | "danger" | "warning" | "info"`, `style?`.

```jsx
<Grid columns="repeat(auto-fit, minmax(140px, 1fr))" gap={14}>
  <Stat value="99.98%" label="Availability" tone="success" />
  <Stat value="184 ms" label="P95 latency" tone="info" />
</Grid>
```

Use semantic tone only when the value has semantic meaning. Keep neutral values neutral.

## Charts

All charts render responsive SVG content and accept `style?`. Their data must be non-empty. For bar and line charts, each series `data` array aligns by index with `categories`.

Series shape:

```js
{ name: string, data: number[], tone?: "success" | "danger" | "warning" | "info" | "neutral" }
```

Omit `tone` to use automatic distinct colors. Provide it only when a series carries stable semantic meaning. Multiple series display a legend.

Charts do not provide title, axis-name, source, or time-range props. Supply those visibly with `H2`/`H3` and compact `Text` around the chart.

### `BarChart`

Use for comparing categories.

Props:

- `categories: string[]`, `series: ChartSeries[]`.
- `height?: number`, default `260`.
- `stacked?: boolean` groups by default and stacks when true.
- `horizontal?: boolean` renders horizontal bars.
- `normalized?: boolean` renders 100% stacked data and implies stacking.
- `valueSuffix?: string`, `valuePrefix?: string`.
- `showValues?: boolean`; default is automatic for one series with at most eight categories.
- `beginAtZero?: boolean`, default `true`.
- `yMin?: number`, `yMax?: number` override the value domain.
- `referenceLines?: Array<{ value: number; label?: string; tone?: ChartTone }>`.
- `style?`.

```jsx
<Stack gap={8}>
  <H2>Requests by outcome</H2>
  <BarChart
    categories={["Mon", "Tue", "Wed"]}
    series={[
      { name: "Accepted", data: [70, 80, 60], tone: "success" },
      { name: "Rejected", data: [30, 20, 40], tone: "danger" },
    ]}
    stacked
    referenceLines={[{ value: 100, label: "Daily target", tone: "info" }]}
  />
  <Text size="small" tone="tertiary">Source: gateway logs · daily totals</Text>
</Stack>
```

Use `horizontal` when labels are long. Stacked and normalized bars ignore explicit value-domain controls and always start at zero.

### `LineChart`

Use for ordered trends. It treats categories as labels and does not parse dates.

Props:

- `categories`, `series`, `height?: number` (default `260`).
- `fill?: boolean` adds a soft area tint.
- `valueSuffix?`, `valuePrefix?`.
- `showValues?: boolean`, default `false`; labels are only useful for at most 20 categories.
- `showHoverGuide?: boolean`, default `true`.
- `beginAtZero?: boolean`, default `true`.
- `yMin?`, `yMax?`, `referenceLines?`, `style?`.

```jsx
<LineChart
  categories={["09:00", "10:00", "11:00", "12:00"]}
  series={[{ name: "P95 latency", data: [182, 194, 171, 210], tone: "info" }]}
  valueSuffix=" ms"
  referenceLines={[{ value: 200, label: "SLO", tone: "warning" }]}
/>
```

Set `beginAtZero={false}` for tightly clustered values such as 99.0-99.9% uptime when a zero baseline would flatten the trend. Disclose this framing near the chart.

### `PieChart`

Use only for a small part-to-whole composition. Do not use it for ordinary category comparison.

Props: `data: Array<{ label: string; value: number; tone?: ChartTone }>`, `size?: number` (default `200`), `donut?: boolean`, `style?`.

```jsx
<PieChart
  donut
  data={[
    { label: "Application", value: 62 },
    { label: "Database", value: 24 },
    { label: "Network", value: 14 },
  ]}
/>
```

Keep slice count small enough to scan. Negative values are treated as zero.

## Diffs

### `DiffStats`

Compact additions/deletions summary. Props: `additions?: number`, `deletions?: number`, `style?`. It renders nothing when both values are zero. Place it in `CardHeader.trailing` for a titled file diff.

### `DiffView`

Props:

- `lines: Array<{ type: "added" | "removed" | "unchanged"; content: string; lineNumber?: number }>`.
- `path?: string` enables language inference from the extension.
- `language?: string` overrides inference.
- `showLineNumbers?: boolean`, default `true`.
- `coloredLineNumbers?: boolean`, default `true`.
- `showAccentStrip?: boolean`, default `true`.
- `style?`.

```jsx
<Card>
  <CardHeader trailing={<DiffStats additions={1} deletions={1} />}>src/config.ts</CardHeader>
  <CardBody style={{ padding: 0 }}>
    <DiffView
      path="src/config.ts"
      lines={[
        { type: "removed", lineNumber: 12, content: "const timeout = 5000;" },
        { type: "added", lineNumber: 12, content: "const timeout = 8000;" },
      ]}
    />
  </CardBody>
</Card>
```

## Tasks And Disclosure

Task shape:

```js
{ id: string, content: string, status: "pending" | "in_progress" | "completed" | "cancelled" }
```

### `TodoList`

Props: `todos`, `dimmedTodoIds?: ReadonlySet<string>`, `onTodoClick?: (todo) => void`, `style?`. It renders nothing for an empty array. With `onTodoClick`, each row is interactive.

### `TodoListCard`

Props: all `TodoList` props plus `defaultExpanded?: boolean` (default `false`). It adds a framed disclosure header with completion count and renders nothing for an empty list.

Use `TodoList` inside an existing section; use `TodoListCard` when tasks are a distinct bounded unit.

## Usage And Color

### `UsageBar`

Segment shape: `{ id: string, value: number, color?: Color }`.

Props: `segments`, `total: number`, `topLeftLabel?`, `topRightLabel?`, `style?`.

Values are clamped to non-negative numbers. Omitted colors rotate through the shared category sequence.

```jsx
<UsageBar
  total={128000}
  segments={[
    { id: "Application", value: 72000, color: "blue" },
    { id: "Database", value: 31000, color: "purple" },
  ]}
  topLeftLabel="Storage used"
  topRightLabel="103 GB / 128 GB"
/>
```

### `Swatch`

Props: `color: Color`, `style?`. Use it as a compact category legend marker. Valid category colors are `blue`, `orange`, `green`, `yellow`, `purple`, `cyan`, `pink`, `red`, and `gray`.

Use the same color value in `Swatch` and `UsageBar` to keep categories coherent.

## DAG Layout

`computeDAGLayout(options)` computes geometry; it does not render anything. Render the result with JSX `<svg>` elements using `useHostTheme()` colors.

Options:

- `nodes: Array<{ id: string }>`.
- `edges: Array<{ from: string; to: string }>`.
- `direction?: "vertical" | "horizontal"`, default `"vertical"`.
- `nodeWidth?: number`, default `160`.
- `nodeHeight?: number`, default `40`.
- `rankGap?: number`, default `64`.
- `nodeGap?: number`, default `48`.
- `padding?: number`, default `24`.

Result:

```js
{
  nodes: [{ id, x, y, rank, order }],
  edges: [{ from, to, sourceX, sourceY, targetX, targetY, isBackEdge }],
  ranks: [{ rank, x, y, width, height, nodeIds }],
  direction,
  width,
  height,
}
```

```jsx
const layout = computeDAGLayout({
  nodes: [{ id: "api" }, { id: "db" }],
  edges: [{ from: "api", to: "db" }],
  direction: "vertical",
});

function Architecture() {
  const theme = useHostTheme();
  return (
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width: "100%" }}>
      {layout.edges.map((edge) => (
        <line
          key={`${edge.from}-${edge.to}`}
          x1={edge.sourceX}
          y1={edge.sourceY}
          x2={edge.targetX}
          y2={edge.targetY}
          stroke={edge.isBackEdge ? theme.category.red : theme.stroke.primary}
        />
      ))}
      {layout.nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <rect width="160" height="40" rx="4" fill={theme.bg.elevated} stroke={theme.stroke.secondary} />
          <text x="80" y="24" textAnchor="middle" fill={theme.text.primary}>{node.id}</text>
        </g>
      ))}
    </svg>
  );
}
```

Use `isBackEdge` to style cycle-causing edges distinctly. Keep node dimensions consistent with the dimensions passed to the layout function.
