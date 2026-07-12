import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Checkbox,
  DiffStats,
  Select,
  TextArea,
  TextInput,
  TodoList,
  TodoListCard,
  Toggle,
  UsageBar,
  useHostTheme,
} from "@canvasx/react";
import { CanvasProvider } from "@canvasx/react/host";

function AccentProbe() {
  const theme = useHostTheme();
  return <span data-testid="accent">{theme.accent.primary}</span>;
}

describe("form and data behavior contracts", () => {
  it("delivers controlled form values instead of DOM events", () => {
    const onText = vi.fn();
    const onArea = vi.fn();
    const onCheck = vi.fn();
    const onToggle = vi.fn();
    const onSelect = vi.fn();
    render(
      <CanvasProvider>
        <TextInput value="" onChange={onText} placeholder="Name" />
        <TextArea value="" onChange={onArea} placeholder="Notes" />
        <Checkbox checked={false} onChange={onCheck} label="Include" />
        <Toggle checked={false} onChange={onToggle} />
        <Select value="a" onChange={onSelect} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />
      </CanvasProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByPlaceholderText("Notes"), { target: { value: "Ready" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Include" }));
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });

    expect(onText).toHaveBeenCalledWith("Ada");
    expect(onArea).toHaveBeenCalledWith("Ready");
    expect(onCheck).toHaveBeenCalledWith(true);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("omits empty task and diff surfaces", () => {
    const { container } = render(
      <CanvasProvider>
        <TodoList todos={[]} />
        <TodoListCard todos={[]} />
        <DiffStats additions={0} deletions={0} />
      </CanvasProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("clamps invalid usage values and leaves visible remainder capacity", () => {
    const { container } = render(
      <CanvasProvider>
        <UsageBar
          total={100}
          segments={[
            { id: "valid", value: 25, color: "blue" },
            { id: "negative", value: -10, color: "red" },
            { id: "invalid", value: Number.NaN, color: "gray" },
          ]}
        />
      </CanvasProvider>,
    );
    expect(container.querySelector('[title="valid: 25"]')).toHaveStyle({ width: "25%" });
    expect(container.querySelector('[title="negative: 0"]')).toHaveStyle({ width: "0%" });
    expect(container.querySelector('[title="invalid: 0"]')).toHaveStyle({ width: "0%" });
  });

  it("ignores invalid primary theme overrides", () => {
    const { rerender } = render(
      <CanvasProvider themeOverrides={{ primary: "not-a-color" }}><AccentProbe /></CanvasProvider>,
    );
    expect(screen.getByTestId("accent")).toHaveTextContent("#599CE7");

    rerender(<CanvasProvider themeOverrides={{ primary: "#123456" }}><AccentProbe /></CanvasProvider>);
    expect(screen.getByTestId("accent")).toHaveTextContent("#123456");
  });
});
