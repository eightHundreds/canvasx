import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildHostTokens,
  type CanvasHostThemeOverrides,
  type CanvasPalette,
  type CanvasTokens,
} from "./theme";

export type CanvasAction =
  | { type: "openAgent"; agentId: string }
  | { type: "newComposerChat"; userPrompt?: string }
  | {
      type: "openFile";
      path: string;
      selection?: {
        startLineNumber: number;
        startColumn?: number;
        endLineNumber?: number;
        endColumn?: number;
      };
    }
  | { type: "openUrl"; url: string; target?: "_self" | "_blank" }
  | { type: "copyText"; text: string }
  | { type: "custom"; name: string; payload?: unknown };

export interface CanvasHostTheme extends CanvasTokens {
  readonly kind: string;
  readonly tokens: CanvasTokens;
  readonly palette: CanvasPalette;
}

type HostContextValue = {
  theme: CanvasHostTheme;
  dispatch: (action: CanvasAction) => void;
  storagePrefix: string;
};

const HostContext = createContext<HostContextValue | null>(null);
const fallbackResolved = buildHostTokens("dark");
const fallbackDispatch = (action: CanvasAction) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("standalone-canvas-action", { detail: action }));
  }
};
const fallbackHost: HostContextValue = {
  theme: {
    ...fallbackResolved.tokens,
    kind: "dark",
    tokens: fallbackResolved.tokens,
    palette: fallbackResolved.palette,
  },
  dispatch: fallbackDispatch,
  storagePrefix: "standalone-canvas",
};

export type CanvasProviderProps = {
  children: ReactNode;
  theme?: "dark" | "light" | string;
  storagePrefix?: string;
  onAction?: (action: CanvasAction) => void;
  themeOverrides?: CanvasHostThemeOverrides;
};

export function CanvasProvider({
  children,
  theme: kind = "dark",
  storagePrefix = "standalone-canvas",
  onAction,
  themeOverrides,
}: CanvasProviderProps) {
  const value = useMemo<HostContextValue>(() => {
    const resolved = buildHostTokens(kind, themeOverrides);
    const theme = {
      ...resolved.tokens,
      kind,
      tokens: resolved.tokens,
      palette: resolved.palette,
    };
    const dispatch = (action: CanvasAction) => {
      onAction?.(action);
      window.dispatchEvent(new CustomEvent("standalone-canvas-action", { detail: action }));
    };
    return { theme, dispatch, storagePrefix };
  }, [kind, onAction, storagePrefix, themeOverrides]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--canvas-editor", value.theme.bg.editor);
    root.style.setProperty("--canvas-chrome", value.theme.bg.chrome);
    root.style.setProperty("--canvas-elevated", value.theme.bg.elevated);
    root.style.setProperty("--canvas-text-primary", value.theme.text.primary);
    root.style.setProperty("--canvas-text-secondary", value.theme.text.secondary);
    root.style.setProperty("--canvas-text-tertiary", value.theme.text.tertiary);
    root.style.setProperty("--canvas-stroke-primary", value.theme.stroke.primary);
    root.style.setProperty("--canvas-stroke-secondary", value.theme.stroke.secondary);
    root.style.setProperty("--canvas-fill-tertiary", value.theme.fill.tertiary);
  }, [value]);

  return <HostContext.Provider value={value}>{children}</HostContext.Provider>;
}

function useHost() {
  const context = useContext(HostContext);
  return context ?? fallbackHost;
}

export function useHostTheme(): CanvasHostTheme {
  return useHost().theme;
}

export type SetCanvasState<T> = (action: T | ((previous: T) => T)) => void;

export function useCanvasState<T>(key: string, defaultValue: T): [T, SetCanvasState<T>] {
  const { storagePrefix } = useHost();
  const storageKey = `${storagePrefix}:${key}`;
  const readStored = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? defaultValue : (JSON.parse(stored) as T);
    } catch {
      return defaultValue;
    }
  }, [defaultValue, storageKey]);
  const [state, setState] = useState(() => ({ storageKey, value: readStored() }));
  const value = state.storageKey === storageKey ? state.value : readStored();

  useEffect(() => {
    if (state.storageKey !== storageKey) {
      setState({ storageKey, value: readStored() });
    }
  }, [readStored, state.storageKey, storageKey]);

  useEffect(() => {
    if (state.storageKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.value));
    } catch {
      // Storage may be disabled; state remains usable for the current session.
    }
  }, [state, storageKey]);

  const setValue = useCallback<SetCanvasState<T>>((action) => {
    setState((current) => {
      const previous = current.storageKey === storageKey ? current.value : readStored();
      return {
        storageKey,
        value: typeof action === "function" ? (action as (value: T) => T)(previous) : action,
      };
    });
  }, [readStored, storageKey]);

  return [value, setValue];
}

export function useCanvasAction(): (action: CanvasAction) => void {
  const { dispatch } = useHost();
  return useCallback((action: CanvasAction) => dispatch(action), [dispatch]);
}
