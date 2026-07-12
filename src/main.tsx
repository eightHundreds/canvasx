import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Moon, Sun } from "lucide-react";
import Canvas, { canvasId } from "virtual:canvas-entry";
import type { CanvasAction } from "@canvasx/react";
import { CanvasProvider } from "@canvasx/react/host";
import "./styles.css";

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
  );
  const [lastAction, setLastAction] = useState<CanvasAction | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <CanvasProvider theme={theme} storagePrefix={`standalone-canvas:${canvasId}`} onAction={setLastAction}>
      <header className="runner-toolbar">
        <div>
          <strong>CanvasX</strong>
          <span>Portable React artifact runner</span>
        </div>
        <button
          className="runner-icon-button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          type="button"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>
      <main className="canvas-host">
        <Canvas />
      </main>
      {lastAction ? (
        <div className="runner-action" role="status">
          Host action: <code>{lastAction.type}</code>
        </div>
      ) : null}
    </CanvasProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
