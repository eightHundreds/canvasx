import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Button,
  type CanvasAction,
  useCanvasAction,
  useCanvasState,
} from "@canvasx/react";
import { CanvasProvider } from "@canvasx/react/host";

function StatefulCanvas() {
  const [count, setCount] = useCanvasState("count", 0);
  return <Button onClick={() => setCount((value) => value + 1)}>Count {count}</Button>;
}

function ActionCanvas() {
  const dispatch = useCanvasAction();
  return (
    <>
      <Button onClick={() => dispatch({ type: "openAgent", agentId: "agent-123" })}>Open agent</Button>
      <Button onClick={() => dispatch({ type: "newComposerChat", userPrompt: "Explain this report" })}>New chat</Button>
      <Button onClick={() => dispatch({ type: "openFile", path: "src/app.ts" })}>Open file</Button>
      <Button onClick={() => dispatch({ type: "openUrl", url: "https://example.com" })}>
        Open URL
      </Button>
      <Button onClick={() => dispatch({ type: "copyText", text: "canvas output" })}>
        Copy text
      </Button>
      <Button onClick={() => dispatch({ type: "custom", name: "refresh", payload: { force: true } })}>
        Custom action
      </Button>
    </>
  );
}

describe("standalone host", () => {
  it("persists canvas state through localStorage", () => {
    localStorage.clear();
    const first = render(<CanvasProvider storagePrefix="test"><StatefulCanvas /></CanvasProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
    expect(screen.getByRole("button", { name: "Count 1" })).toBeInTheDocument();
    first.unmount();

    render(<CanvasProvider storagePrefix="test"><StatefulCanvas /></CanvasProvider>);
    expect(screen.getByRole("button", { name: "Count 1" })).toBeInTheDocument();
  });

  it("delivers editor-neutral actions to the host adapter", () => {
    const actions: CanvasAction[] = [];
    render(
      <CanvasProvider onAction={(action) => actions.push(action)}>
        <ActionCanvas />
      </CanvasProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open agent" }));
    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Open file" }));
    fireEvent.click(screen.getByRole("button", { name: "Open URL" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
    fireEvent.click(screen.getByRole("button", { name: "Custom action" }));

    expect(actions).toEqual([
      { type: "openAgent", agentId: "agent-123" },
      { type: "newComposerChat", userPrompt: "Explain this report" },
      { type: "openFile", path: "src/app.ts" },
      { type: "openUrl", url: "https://example.com" },
      { type: "copyText", text: "canvas output" },
      { type: "custom", name: "refresh", payload: { force: true } },
    ]);
  });
});
