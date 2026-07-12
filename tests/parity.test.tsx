import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BarChart,
  Button,
  Card,
  CardBody,
  CardHeader,
  CollapsibleSection,
  DiffView,
  LineChart,
  Pill,
  Table,
  Text,
  useCanvasState,
  type CardBodyProps,
  type CardHeaderProps,
  type CardSize,
  type CardVariant,
  type CodeProps,
  type DividerProps,
  type H1Props,
  type H2Props,
  type H3Props,
  type LinkProps,
  type StatProps,
  type SwatchProps,
} from "@canvasx/react";
import { CanvasProvider } from "@canvasx/react/host";

const officialTypeSurface: [
  DividerProps?, H1Props?, H2Props?, H3Props?, CodeProps?, LinkProps?,
  CardSize?, CardVariant?, CardHeaderProps?, CardBodyProps?, StatProps?, SwatchProps?,
] = [];

function NamespacedState() {
  const [value] = useCanvasState("value", "default");
  return <span>{value}</span>;
}

describe("official compatibility contracts", () => {
  it("exports the official public type surface", () => {
    expect(officialTypeSurface).toEqual([]);
  });

  it("renders nested Text as inline content and parses inline markdown", () => {
    const { container } = render(
      <CanvasProvider>
        <Text>Read <Text weight="semibold">this</Text> and `code` in the [docs](https://example.com).</Text>
      </CanvasProvider>,
    );

    expect(container.querySelector("p p")).toBeNull();
    expect(container.querySelector("p > span")).toHaveTextContent("this");
    expect(container.querySelector("code")).toHaveTextContent("code");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute("href", "https://example.com");
  });

  it("keeps clickable pills from submitting forms", () => {
    let submissions = 0;
    render(
      <CanvasProvider>
        <form onSubmit={(event) => { event.preventDefault(); submissions += 1; }}>
          <Pill onClick={() => {}}>Filter</Pill>
        </form>
      </CanvasProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    expect(submissions).toBe(0);
  });

  it("does not hide non-collapsible cards when open is false", () => {
    render(<CanvasProvider><Card open={false}><CardHeader>Visible</CardHeader><CardBody>Body</CardBody></Card></CanvasProvider>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("keeps trailing disclosure actions outside the toggle button", () => {
    const { container } = render(
      <CanvasProvider>
        <CollapsibleSection title="Details" trailing={<Button>Run</Button>}>Body</CollapsibleSection>
      </CanvasProvider>,
    );
    expect(container.querySelector("button button")).toBeNull();
    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute("aria-expanded", "false");
  });

  it("accepts Text cells without invalid span/paragraph nesting", () => {
    const { container } = render(
      <CanvasProvider>
        <Table headers={["Name"]} rows={[[<Text key="cell">API</Text>]]} rowTone={["success"]} />
      </CanvasProvider>,
    );
    expect(container.querySelector("span p")).toBeNull();
  });

  it("pads short table rows and ignores cells beyond the headers", () => {
    const { container } = render(
      <CanvasProvider>
        <Table headers={["Name", "Status"]} rows={[["API"], ["Worker", "Healthy", "ignored"]]} />
      </CanvasProvider>,
    );
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll("td")).toHaveLength(2);
    expect(rows[1].querySelectorAll("td")).toHaveLength(2);
    expect(container).not.toHaveTextContent("ignored");
  });

  it("uses path-aware syntax highlighting in DiffView", () => {
    const { container } = render(
      <CanvasProvider>
        <DiffView path="src/app.ts" lines={[{ type: "added", content: 'const answer = "yes";', lineNumber: 1 }]} />
      </CanvasProvider>,
    );
    expect(container.querySelectorAll("code span").length).toBeGreaterThan(1);
  });

  it("rehydrates state when the canvas namespace changes", async () => {
    localStorage.setItem("canvas-a:value", JSON.stringify("alpha"));
    localStorage.setItem("canvas-b:value", JSON.stringify("beta"));
    const view = render(<CanvasProvider storagePrefix="canvas-a"><NamespacedState /></CanvasProvider>);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    view.rerender(<CanvasProvider storagePrefix="canvas-b"><NamespacedState /></CanvasProvider>);
    await waitFor(() => expect(screen.getByText("beta")).toBeInTheDocument());
  });

  it("implements chart fill and per-category single-series colors", async () => {
    const lineView = render(
      <CanvasProvider>
        <LineChart fill categories={["A", "B"]} series={[{ name: "Latency", data: [10, 20] }]} />
      </CanvasProvider>,
    );
    expect(lineView.container.querySelector(".recharts-area-area")).toBeInTheDocument();
    lineView.unmount();

    const barView = render(
      <CanvasProvider>
        <BarChart categories={["A", "B", "C"]} series={[{ name: "Requests", data: [1, 2, 3] }]} />
      </CanvasProvider>,
    );
    await waitFor(() => {
      const fills = [...barView.container.querySelectorAll(".recharts-bar-rectangle path")].map((element) => element.getAttribute("fill"));
      expect(new Set(fills).size).toBe(3);
    });
  });

  it("preserves negative bar and line values", async () => {
    const barView = render(
      <CanvasProvider>
        <BarChart
          categories={["Loss", "Gain"]}
          series={[{ name: "Delta", data: [-5, 8] }]}
          beginAtZero={false}
          showValues
        />
      </CanvasProvider>,
    );
    await waitFor(() => expect(barView.container).toHaveTextContent("-5"));
    barView.unmount();

    const lineView = render(
      <CanvasProvider>
        <LineChart
          categories={["Before", "After"]}
          series={[{ name: "Net change", data: [-3, 4] }]}
          beginAtZero={false}
          showValues
        />
      </CanvasProvider>,
    );
    await waitFor(() => expect(lineView.container).toHaveTextContent("-3"));
  });
});
