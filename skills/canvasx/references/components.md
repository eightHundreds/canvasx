# Components

This reference covers layout, typography, surfaces, actions, disclosures, and forms. All `style` props accept ordinary React inline-style objects. Prefer small overrides; use built-ins and flat theme-token colors for the main design.

## Contents

- Layout
- Typography
- Cards And Disclosures
- Actions And Feedback
- Forms

## Layout

### `Stack`

Vertical flex column. Use it for page structure and vertically grouped content.

```jsx
<Stack gap={16} style={{ minWidth: 0 }}>
  <H1>Dashboard</H1>
  <Text tone="secondary">Last updated 10:30 UTC</Text>
</Stack>
```

Props: `children`, `gap?: number` (default `12`), `style?`.

### `Row`

Horizontal flex row for actions, metadata, badges, or compact alignment.

Props:

- `gap?: number` defaults to `8`.
- `align?: "start" | "center" | "end" | "stretch"` defaults to `"center"`.
- `justify?: "start" | "center" | "end" | "space-between"` defaults to `"start"`.
- `wrap?: boolean` enables wrapping.
- `children`, `style?`.

```jsx
<Row gap={8} align="center">
  <Text>Deployment</Text>
  <Spacer />
  <Pill active>Healthy</Pill>
</Row>
```

### `Grid`

CSS grid for responsive or fixed columns. Prefer it over a wrapping `Row` for dashboards and boards.

Props: `children`, `columns: number | string`, `gap?: number` (default `12`), `align?: "start" | "center" | "end" | "stretch"`, `style?`.

```jsx
<Grid columns="repeat(auto-fit, minmax(min(100%, 260px), 1fr))" gap={16}>
  {services.map((service) => <ServiceCard key={service.id} service={service} />)}
</Grid>
```

A numeric `columns={3}` becomes three equal `minmax(0, 1fr)` columns. Use a responsive string when the artifact must work on mobile.

### `Divider` And `Spacer`

`Divider` renders a full-width semantic hairline and accepts `style?`. `Spacer` accepts no props and expands inside a `Row` to push following content to the far edge.

## Typography

### `Text`

Body text with hierarchy and inline composition.

Props:

- `tone?: "primary" | "secondary" | "tertiary" | "quaternary"`, default `"primary"`.
- `size?: "body" | "small"`, default `"body"`.
- `as?: "p" | "span"`.
- `weight?: "normal" | "medium" | "semibold" | "bold"`, default `"normal"`.
- `italic?: boolean`.
- `truncate?: boolean | "start" | "end"`.
- `children`, `style?`.

Top-level `Text` renders a paragraph. Nested `Text` switches to an inline span. Backtick code and Markdown-style links inside string children are parsed.

```jsx
<Text>
  Read <Text weight="semibold">this result</Text>, run `pnpm test`, and see the
  [runbook](https://example.com/runbook).
</Text>
```

Truncation needs a bounded parent width and usually `minWidth: 0`. Use `truncate="start"` for long paths where the filename matters most.

### `H1`, `H2`, `H3`

Each accepts `children` and `style?`.

- Use `H1` once for the page-level title.
- Use `H2` between major sections.
- Use `H3` below an `H2` for subsections.
- Do not put headings inside `CardHeader`; its compact label supplies its own typography.

### `Code` And `Link`

`Code` accepts `children`, `style?` and renders inline code. Prefer backticks inside `Text` for ordinary prose.

`Link` accepts `href: string`, `children`, `style?` and opens in a new browser tab. Prefer Markdown-style links inside `Text` for ordinary prose.

## Cards And Disclosures

### `Card`, `CardHeader`, `CardBody`

Use a card for a labeled, self-contained entity such as a file, service, resource, configuration block, or titled diff. Do not use it for every general text section and never nest cards.

`Card` props:

- `variant?: "default" | "borderless"`, default `"default"`.
- `size?: "base" | "lg"`, default `"base"`.
- `stickyHeader?: boolean`, default `false`.
- `collapsible?: boolean`, default `false`.
- `defaultOpen?: boolean`, default `true`.
- `open?: boolean` for controlled state.
- `onOpenChange?: (open: boolean) => void`.
- `children`, `style?`.

`CardHeader` accepts plain compact `children`, one compact `trailing` item, and `style?`. Do not use headings, rows, button groups, or several pills as its title.

`CardBody` accepts `children`, `style?`. Use `style={{ padding: 0 }}` when a diff or other edge-to-edge view should meet the card boundary.

```jsx
<Card>
  <CardHeader trailing={<DiffStats additions={5} deletions={2} />}>
    src/utils.ts
  </CardHeader>
  <CardBody style={{ padding: 0 }}>
    <DiffView path="src/utils.ts" lines={lines} />
  </CardBody>
</Card>
```

```jsx
<Card collapsible defaultOpen={false}>
  <CardHeader>Deployment details</CardHeader>
  <CardBody><Text>Three regions completed.</Text></CardBody>
</Card>
```

`stickyHeader` only has visible effect when the card or an ancestor has constrained height and scrolling.

### `CollapsibleSection`

Borderless disclosure row for optional supporting detail. Prefer it over a card when the content does not need a framed surface.

Props: `title: string`, `leading?`, `count?: number`, `trailing?`, `children?`, `defaultOpen?: boolean` (default `false`), `style?`.

Keep `trailing` compact. It is placed outside the disclosure button so an interactive trailing element remains valid HTML.

## Actions And Feedback

### `Button`

Props: `children`, `variant?: "primary" | "secondary" | "ghost"` (default `"secondary"`), `disabled?`, `type?: "button" | "submit" | "reset"` (default `"button"`), `onClick?: () => void`, `style?`.

Use `primary` for the single main action in a local context, `secondary` for ordinary commands, and `ghost` for low-emphasis actions.

### `IconButton`

Compact icon-only action.

Props: `children`, `onClick?`, `disabled?`, `title?: string`, `variant?: "default" | "circle"` (default `"default"`), `size?: "sm" | "md"` (default `"md"`), `style?`.

Always provide `title`; it becomes the accessible label and tooltip. Pass an inline SVG or familiar symbol. Do not depend on an icon font.

### `Pill`

Compact label or toggle for filters, tabs, and statuses.

Props: `children`, `active?`, `tone?: "neutral" | "added" | "deleted" | "renamed" | "success" | "warning" | "info"`, `size?: "sm" | "md"` (default `"md"`), `leadingContent?`, `keyboardHint?`, `disabled?`, `title?`, `onClick?`, `style?`.

With `onClick`, it renders a `type="button"` control and will not submit a surrounding form. Use a small number of pills and avoid rainbow status rows.

### `Callout`

Semantic note for a risk, warning, success, or important observation.

Props: `children`, `tone?: "info" | "success" | "warning" | "danger" | "neutral"` (default `"info"`), `title?`, `icon?`, `style?`.

```jsx
<Callout tone="warning" title="Capacity risk">
  Projected peak usage reaches 92% of the current limit.
</Callout>
```

## Forms

All form controls are controlled components. Their `onChange` callback receives the new value directly, not a DOM event, so it can use a `useCanvasState` setter.

### `TextInput`

Props: `value?: string`, `onChange?: (value: string) => void`, `placeholder?`, `disabled?`, `type?: "text" | "email" | "password" | "number" | "search" | "url"` (default `"text"`), `style?`.

```jsx
const [query, setQuery] = useCanvasState("query", "");
<TextInput value={query} onChange={setQuery} placeholder="Filter services" />
```

### `TextArea`

Props: `value?: string`, `onChange?: (value: string) => void`, `placeholder?`, `disabled?`, `rows?: number` (default `3`), `style?`.

It grows with content unless an explicit height is provided. Use it for notes, descriptions, and multi-line input.

### `Checkbox`

Props: `checked?: boolean`, `onChange?: (checked: boolean) => void`, `disabled?`, `label?`, `style?`.

Prefer `label` for a clickable accessible label.

```jsx
const [included, setIncluded] = useCanvasState("include-archived", false);
<Checkbox checked={included} onChange={setIncluded} label="Include archived" />
```

### `Toggle`

Props: `checked?: boolean`, `onChange?: (checked: boolean) => void`, `disabled?`, `size?: "sm" | "md"` (default `"sm"`), `style?`.

Use for an immediately applied binary setting, not for choosing among several options.

### `Select`

Props: `value?: string`, `onChange?: (value: string) => void`, `options: Array<{ value: string; label: string; disabled?: boolean }>`, `placeholder?`, `disabled?`, `style?`.

```jsx
const [windowSize, setWindowSize] = useCanvasState("window", "7d");
<Select
  value={windowSize}
  onChange={setWindowSize}
  options={[
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
  ]}
/>
```
