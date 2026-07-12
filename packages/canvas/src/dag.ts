import dagre from "@dagrejs/dagre";

export type DAGLayoutOptions = {
  nodes: Array<{ id: string }>;
  edges: Array<{ from: string; to: string }>;
  direction?: "vertical" | "horizontal";
  nodeWidth?: number;
  nodeHeight?: number;
  rankGap?: number;
  nodeGap?: number;
  padding?: number;
};
export type DAGLayoutNode = { id: string; x: number; y: number; rank: number; order: number };
export type DAGLayoutEdge = { from: string; to: string; sourceX: number; sourceY: number; targetX: number; targetY: number; isBackEdge: boolean };
export type DAGLayoutRank = { rank: number; x: number; y: number; width: number; height: number; nodeIds: string[] };
export type DAGLayoutResult = { nodes: DAGLayoutNode[]; edges: DAGLayoutEdge[]; ranks: DAGLayoutRank[]; direction: "vertical" | "horizontal"; width: number; height: number };

function findBackEdges(nodes: Array<{ id: string }>, edges: Array<{ from: string; to: string }>) {
  const adjacency = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of edges) adjacency.get(edge.from)?.push(edge.to);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const back = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of adjacency.get(id) ?? []) {
      if (visiting.has(target)) back.add(`${id}\0${target}`);
      else visit(target);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const node of nodes) visit(node.id);
  return back;
}

export function computeDAGLayout({ nodes, edges, direction = "vertical", nodeWidth = 160, nodeHeight = 40, rankGap = 64, nodeGap = 48, padding = 24 }: DAGLayoutOptions): DAGLayoutResult {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: direction === "vertical" ? "TB" : "LR", ranksep: rankGap, nodesep: nodeGap, marginx: padding, marginy: padding });
  graph.setDefaultEdgeLabel(() => ({}));
  const backEdges = findBackEdges(nodes, edges);
  nodes.forEach((node) => graph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.filter((edge) => !backEdges.has(`${edge.from}\0${edge.to}`)).forEach((edge) => graph.setEdge(edge.from, edge.to));
  dagre.layout(graph);

  const preliminary = nodes.map((node) => {
    const positioned = graph.node(node.id) ?? { x: padding + nodeWidth / 2, y: padding + nodeHeight / 2 };
    return { id: node.id, x: positioned.x - nodeWidth / 2, y: positioned.y - nodeHeight / 2 };
  });
  const axis = direction === "vertical" ? "y" : "x";
  const grouped = new Map<number, typeof preliminary>();
  for (const node of preliminary) {
    const key = Math.round(node[axis]);
    const group = grouped.get(key) ?? [];
    group.push(node);
    grouped.set(key, group);
  }
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => a - b);
  const positionedNodes: DAGLayoutNode[] = [];
  const ranks: DAGLayoutRank[] = [];
  sortedGroups.forEach(([, group], rank) => {
    group.sort((a, b) => direction === "vertical" ? a.x - b.x : a.y - b.y);
    group.forEach((node, order) => positionedNodes.push({ ...node, rank, order }));
    const minX = Math.min(...group.map((node) => node.x));
    const minY = Math.min(...group.map((node) => node.y));
    const maxX = Math.max(...group.map((node) => node.x + nodeWidth));
    const maxY = Math.max(...group.map((node) => node.y + nodeHeight));
    ranks.push({ rank, x: minX, y: minY, width: maxX - minX, height: maxY - minY, nodeIds: group.map((node) => node.id) });
  });
  const byId = new Map(positionedNodes.map((node) => [node.id, node]));
  const positionedEdges = edges.flatMap((edge) => {
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    if (!source || !target) return [];
    const vertical = direction === "vertical";
    return [{ from: edge.from, to: edge.to, sourceX: source.x + (vertical ? nodeWidth / 2 : nodeWidth), sourceY: source.y + (vertical ? nodeHeight : nodeHeight / 2), targetX: target.x + (vertical ? nodeWidth / 2 : 0), targetY: target.y + (vertical ? 0 : nodeHeight / 2), isBackEdge: backEdges.has(`${edge.from}\0${edge.to}`) }];
  });
  const graphInfo = graph.graph();
  return { nodes: positionedNodes, edges: positionedEdges, ranks, direction, width: Math.max(graphInfo.width ?? 0, nodeWidth + padding * 2), height: Math.max(graphInfo.height ?? 0, nodeHeight + padding * 2) };
}
