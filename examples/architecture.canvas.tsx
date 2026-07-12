import {
  BarChart,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  DiffStats,
  DiffView,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TextInput,
  UsageBar,
  computeDAGLayout,
  useCanvasAction,
  useCanvasState,
  useHostTheme,
} from "@canvasx/react";

const graphNodes = [
  { id: "skill" },
  { id: "tsx" },
  { id: "sdk" },
  { id: "runner" },
];
const graphEdges = [
  { from: "skill", to: "tsx" },
  { from: "tsx", to: "sdk" },
  { from: "sdk", to: "runner" },
];

function ArchitectureDiagram() {
  const theme = useHostTheme();
  const nodeWidth = 108;
  const layout = computeDAGLayout({ nodes: graphNodes, edges: graphEdges, direction: "vertical", nodeWidth, nodeHeight: 44, rankGap: 24, nodeGap: 20, padding: 12 });
  const labels: Record<string, string> = { skill: "Canvas Skill", tsx: "Single HTML", sdk: "StandaloneCanvas", runner: "Browser" };
  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={layout.width} height={layout.height} role="img" aria-label="Standalone canvas architecture" style={{ display: "block", margin: "0 auto" }}>
        {layout.edges.map((edge) => <path key={`${edge.from}-${edge.to}`} d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX + 28} ${edge.sourceY}, ${edge.targetX - 28} ${edge.targetY}, ${edge.targetX} ${edge.targetY}`} fill="none" stroke={theme.stroke.primary} strokeWidth={1.5} />)}
        {layout.nodes.map((node) => <g key={node.id} transform={`translate(${node.x} ${node.y})`}><rect width={nodeWidth} height={44} rx={6} fill={theme.fill.tertiary} stroke={node.id === "runner" ? theme.accent.primary : theme.stroke.secondary} /><text x={nodeWidth / 2} y={27} textAnchor="middle" fill={theme.text.primary} fontSize={11} fontWeight={600}>{labels[node.id]}</text></g>)}
      </svg>
    </div>
  );
}

export default function ArchitectureCanvas() {
  const [filter, setFilter] = useCanvasState("component-filter", "all");
  const dispatch = useCanvasAction();
  const rows = [
    ["Layout", "Stack, Row, Grid, Card", "Implemented"],
    ["Data", "Table, Stat, charts, diff", "Implemented"],
    ["Host", "theme, state, actions", "Adapted"],
    ["Runtime", "Embedded UMD + React", "Independent"],
  ].filter((row) => filter === "all" || row[0].toLowerCase().includes(filter.toLowerCase()));

  return (
    <Stack gap={22}>
      <Row align="start" justify="space-between" wrap>
        <Stack gap={5}>
          <Pill size="sm" active>Portable runtime</Pill>
          <H1>CanvasX</H1>
          <Text tone="secondary">Interactive reports that run directly in a browser.</Text>
        </Stack>
        <Button variant="primary" onClick={() => dispatch({ type: "custom", name: "explain-report" })}>Trigger host action</Button>
      </Row>

      <Grid columns="repeat(auto-fit, minmax(130px, 1fr))" gap={16}>
        <Stat value="40+" label="Public exports" tone="info" />
        <Stat value="0" label="Required installs" tone="success" />
        <Stat value="1" label="Single HTML artifact" />
        <Stat value="100%" label="Local state" tone="warning" />
      </Grid>

      <Callout tone="info" title="Portable delivery">
        The generated artifact is one HTML file with an embedded component runtime and browser-loaded React dependencies.
      </Callout>

      <Grid columns="repeat(auto-fit, minmax(min(100%, 340px), 1fr))" gap={18} style={{ alignItems: "start" }}>
        <Stack gap={10}>
          <H2>Execution flow</H2>
          <ArchitectureDiagram />
        </Stack>
        <Card>
          <CardHeader trailing={<Pill size="sm">Live</Pill>}>Component coverage</CardHeader>
          <CardBody>
            <Stack gap={10}>
              <TextInput value={filter === "all" ? "" : filter} onChange={(value) => setFilter(value || "all")} placeholder="Filter component groups" />
              <Table headers={["Group", "Surface", "Status"]} rows={rows} framed={false} striped />
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Stack gap={10}>
        <H2>Report primitives</H2>
        <Grid columns="repeat(auto-fit, minmax(min(100%, 300px), 1fr))" gap={16}>
          <Card>
            <CardHeader>Weekly canvas renders</CardHeader>
            <CardBody>
              <BarChart categories={["Mon", "Tue", "Wed", "Thu", "Fri"]} series={[{ name: "Successful", data: [8, 12, 15, 13, 19], tone: "success" }, { name: "Type errors", data: [3, 2, 1, 2, 1], tone: "danger" }]} stacked height={220} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Context budget</CardHeader>
            <CardBody>
              <Stack gap={14}>
                <UsageBar total={120000} topLeftLabel="54% used" topRightLabel="64.8K / 120K" segments={[{ id: "system", value: 12000, color: "gray" }, { id: "skills", value: 18000, color: "yellow" }, { id: "data", value: 26000, color: "blue" }, { id: "conversation", value: 8800, color: "orange" }]} />
                <Text size="small" tone="secondary">State persists across reloads through the standalone host adapter.</Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Card collapsible defaultOpen={false}>
        <CardHeader trailing={<DiffStats additions={3} deletions={1} />}>examples/single-file-report.html</CardHeader>
        <CardBody style={{ padding: 0 }}>
          <DiffView lines={[{ type: "unchanged", content: "const { Stack } = StandaloneCanvas;", lineNumber: 1 }, { type: "removed", content: "export default MarkdownReport;", lineNumber: 2 }, { type: "added", content: "function ArchitectureCanvas() {}", lineNumber: 2 }, { type: "added", content: "// Opens directly in a browser", lineNumber: 3 }, { type: "added", content: "// No package installation required", lineNumber: 4 }]} />
        </CardBody>
      </Card>
    </Stack>
  );
}
