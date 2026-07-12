import { describe, expect, it } from "vitest";
import { computeDAGLayout } from "@canvasx/react";

describe("computeDAGLayout", () => {
  it("positions a directed graph and returns usable edge anchors", () => {
    const layout = computeDAGLayout({
      nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
      edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }],
    });

    expect(layout.nodes).toHaveLength(3);
    expect(layout.ranks).toHaveLength(3);
    expect(layout.edges[0].sourceY).toBeLessThan(layout.edges[0].targetY);
    expect(layout.width).toBeGreaterThan(160);
  });

  it("marks cycle edges without failing layout", () => {
    const layout = computeDAGLayout({
      nodes: [{ id: "a" }, { id: "b" }],
      edges: [{ from: "a", to: "b" }, { from: "b", to: "a" }],
    });

    expect(layout.edges.some((edge) => edge.isBackEdge)).toBe(true);
  });
});
