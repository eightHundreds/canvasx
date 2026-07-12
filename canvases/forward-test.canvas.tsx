import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  LineChart,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  computeDAGLayout,
  useHostTheme,
} from "@canvasx/react";

const timeline = ["10:12", "10:20", "10:30", "10:40", "10:50", "10:59"];

const serviceRows = [
  ["Checkout API", "Request orchestration", "812 ms", "8.6%", "Recovered"],
  ["Pricing API", "Root cause", "1,420 ms", "13.1%", "Stabilized"],
  ["Payments API", "Downstream", "338 ms", "0.9%", "Healthy"],
  ["Inventory API", "Downstream", "294 ms", "0.4%", "Healthy"],
  ["Edge Gateway", "Ingress", "226 ms", "1.7%", "Healthy"],
];

const flowNodes = [
  { id: "clients" },
  { id: "checkout" },
  { id: "pricing" },
  { id: "payments" },
  { id: "database" },
];

const flowEdges = [
  { from: "clients", to: "checkout" },
  { from: "checkout", to: "pricing" },
  { from: "checkout", to: "payments" },
  { from: "pricing", to: "database" },
];

function IncidentFlow() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: flowNodes,
    edges: flowEdges,
    direction: "horizontal",
    nodeWidth: 94,
    nodeHeight: 40,
    rankGap: 32,
    nodeGap: 18,
    padding: 12,
  });
  const labels: Record<string, string> = {
    clients: "Clients",
    checkout: "Checkout",
    pricing: "Pricing API",
    payments: "Payments",
    database: "Postgres",
  };

  return (
    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
      <svg
        width={layout.width}
        height={layout.height}
        role="img"
        aria-label="Checkout request flow with Pricing API highlighted as the incident source"
      >
        <defs>
          <marker id="incident-flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill={theme.stroke.primary} />
          </marker>
        </defs>
        {layout.edges.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={`M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX + 22} ${edge.sourceY}, ${edge.targetX - 22} ${edge.targetY}, ${edge.targetX} ${edge.targetY}`}
            fill="none"
            markerEnd="url(#incident-flow-arrow)"
            stroke={theme.stroke.primary}
            strokeWidth={1.5}
          />
        ))}
        {layout.nodes.map((node) => {
          const isRootCause = node.id === "pricing";
          return (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <rect
                width="94"
                height="40"
                rx="6"
                fill={isRootCause ? theme.fill.secondary : theme.fill.tertiary}
                stroke={isRootCause ? theme.category.red : theme.stroke.secondary}
                strokeWidth={isRootCause ? 2 : 1}
              />
              <text
                x="47"
                y="24"
                textAnchor="middle"
                fill={theme.text.primary}
                fontFamily="inherit"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0"
              >
                {labels[node.id]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function ForwardTestIncidentCanvas() {
  return (
    <Stack gap={20}>
      <Row align="start" justify="space-between" wrap gap={14}>
        <Stack gap={5}>
          <Pill size="sm" active>SEV-1 / RESOLVED</Pill>
          <H1>Checkout API degradation</H1>
          <Text tone="secondary">INC-2471: retry amplification after a Pricing API rollout</Text>
        </Stack>
        <Text size="small" tone="tertiary" style={{ textAlign: "right" }}>
          11 Jul 2026<br />10:12-10:59 UTC
        </Text>
      </Row>

      <Grid columns="repeat(auto-fit, minmax(140px, 1fr))" gap={14}>
        <Stat value="47 min" label="Customer impact" tone="danger" />
        <Stat value="812 ms" label="Peak checkout p95" tone="warning" />
        <Stat value="8.6%" label="Peak 5xx rate" tone="danger" />
        <Stat value="1.24M" label="Affected requests" tone="info" />
      </Grid>

      <Callout tone="danger" title="Root cause">
        A Pricing API schema rollout doubled query fan-out and exhausted its connection pool. Checkout retries amplified load; rollback and a temporary retry cap restored service.
      </Callout>

      <Card size="lg">
        <CardHeader trailing={<Pill size="sm">6 samples</Pill>}>
          P95 latency (ms) and 5xx errors/min
        </CardHeader>
        <CardBody>
          <Stack gap={8}>
            <LineChart
              categories={timeline}
              series={[
                { name: "P95 latency (ms)", data: [184, 251, 476, 812, 438, 219], tone: "warning" },
                { name: "5xx errors/min", data: [3, 16, 89, 214, 54, 6], tone: "danger" },
              ]}
              height={250}
              yMin={0}
              yMax={900}
              referenceLines={[{ value: 500, label: "Latency SLO", tone: "warning" }]}
            />
            <Text size="small" tone="tertiary">
              Six incident checkpoints, UTC. Shared numeric axis; source: fictional gateway telemetry.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <Grid columns="repeat(auto-fit, minmax(min(100%, 340px), 1fr))" gap={16} align="start">
        <Card>
          <CardHeader>Service impact</CardHeader>
          <CardBody style={{ padding: 0 }}>
            <Table
              headers={["Service", "Role", "Peak p95", "5xx share", "State"]}
              rows={serviceRows}
              rowTone={["warning", "danger", "success", "success", "info"]}
              columnAlign={["left", "left", "right", "right", "left"]}
              framed={false}
              striped
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Request path</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <IncidentFlow />
              <Text size="small" tone="tertiary">
                Pricing API is highlighted as the retry amplification source.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
