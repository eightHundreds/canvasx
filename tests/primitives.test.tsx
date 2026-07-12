import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart, Stat, Table } from "@canvasx/react";
import { CanvasProvider } from "@canvasx/react/host";

describe("report primitives", () => {
  it("renders structured report data", () => {
    render(
      <CanvasProvider>
        <Stat value="99.9%" label="Availability" tone="success" />
        <Table headers={["Service", "Status"]} rows={[["api", "healthy"]]} />
        <BarChart categories={["Mon", "Tue"]} series={[{ name: "Requests", data: [10, 20] }]} />
      </CanvasProvider>,
    );

    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(document.querySelector(".recharts-responsive-container")).toBeInTheDocument();
  });
});
