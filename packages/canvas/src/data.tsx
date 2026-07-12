import { type CSSProperties, type ReactNode, useState } from "react";
import { Ban, Check, Circle, LoaderCircle } from "lucide-react";
import { useHostTheme } from "./host";
import { CanvasChevron, mergeStyle, Text } from "./primitives";
import { canvasRadius, type Color, usageColorSequence } from "./theme";

export type DiffStatsProps = { additions?: number; deletions?: number; style?: CSSProperties };
export function DiffStats({ additions = 0, deletions = 0, style }: DiffStatsProps) {
  const theme = useHostTheme();
  if (!additions && !deletions) return null;
  return <span style={mergeStyle({ display: "inline-flex", gap: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, fontVariantNumeric: "tabular-nums" }, style)}>{additions ? <span style={{ color: theme.category.green }}>+{additions}</span> : null}{deletions ? <span style={{ color: theme.category.red }}>-{deletions}</span> : null}</span>;
}

export type DiffLineType = "added" | "removed" | "unchanged";
export type DiffLineData = { type: DiffLineType; content: string; lineNumber?: number };
export type DiffViewProps = { lines: DiffLineData[]; path?: string; language?: string; showLineNumbers?: boolean; coloredLineNumbers?: boolean; showAccentStrip?: boolean; style?: CSSProperties };
const languageByExtension: Record<string, string> = { ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx", py: "python", rs: "rust", go: "go", json: "json", md: "markdown", css: "css", html: "html", sh: "shell" };
const languageKeywords: Record<string, string[]> = {
  typescript: ["const", "let", "var", "function", "return", "export", "import", "from", "type", "interface", "extends", "if", "else", "new", "async", "await"],
  tsx: ["const", "let", "function", "return", "export", "import", "from", "type", "interface", "if", "else", "async", "await"],
  javascript: ["const", "let", "var", "function", "return", "export", "import", "from", "if", "else", "new", "async", "await"],
  jsx: ["const", "let", "function", "return", "export", "import", "from", "if", "else"],
  python: ["def", "return", "class", "import", "from", "if", "elif", "else", "for", "while", "async", "await", "with", "as", "None", "True", "False"],
  rust: ["fn", "let", "mut", "pub", "impl", "struct", "enum", "match", "use", "mod", "return", "async", "await"],
  go: ["func", "var", "const", "type", "struct", "interface", "package", "import", "return", "if", "else", "for", "go", "defer"],
};

function inferLanguage(path?: string, language?: string) {
  if (language) return languageByExtension[language] ?? language;
  const extension = path?.split(".").pop()?.toLowerCase();
  return extension ? languageByExtension[extension] : undefined;
}

function HighlightedLine({ content, language }: { content: string; language?: string }) {
  const theme = useHostTheme();
  const keywords = languageKeywords[language ?? ""] ?? [];
  if (!keywords.length) return <>{content || " "}</>;
  const expression = new RegExp(`(//.*$|#.*$|\\b(?:${keywords.join("|")})\\b|(?:\"[^\"]*\"|'[^']*'|\`[^\`]*\`)|\\b\\d+(?:\\.\\d+)?\\b)`, "g");
  return <>{content.split(expression).map((token, index) => {
    if (!token) return null;
    const isComment = token.startsWith("//") || token.startsWith("#");
    const isString = /^["'`]/.test(token);
    const isNumber = /^\d/.test(token);
    const color = isComment ? theme.text.tertiary : isString ? theme.category.green : isNumber ? theme.category.orange : keywords.includes(token) ? theme.category.purple : theme.text.primary;
    return <span key={index} style={{ color }}>{token}</span>;
  })}</>;
}

export function DiffView({ lines, path, language, showLineNumbers = true, coloredLineNumbers = true, showAccentStrip = true, style }: DiffViewProps) {
  const theme = useHostTheme();
  const resolvedLanguage = inferLanguage(path, language);
  return <div style={mergeStyle({ overflowX: "auto", background: theme.bg.editor, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: "19px" }, style)}>{lines.map((line, index) => {
    const changed = line.type !== "unchanged";
    const color = line.type === "added" ? theme.category.green : line.type === "removed" ? theme.category.red : theme.text.tertiary;
    return <div key={index} style={{ display: "grid", gridTemplateColumns: `${showAccentStrip ? 3 : 0}px ${showLineNumbers ? 44 : 0}px 18px minmax(max-content, 1fr)`, minHeight: 20, background: line.type === "added" ? theme.diff.insertedLine : line.type === "removed" ? theme.diff.removedLine : undefined }}><span style={{ background: changed ? (line.type === "added" ? theme.diff.stripAdded : theme.diff.stripRemoved) : "transparent" }} /><span style={{ paddingRight: 8, textAlign: "right", color: coloredLineNumbers && changed ? color : theme.text.quaternary, userSelect: "none" }}>{showLineNumbers ? line.lineNumber ?? "" : null}</span><span style={{ color, userSelect: "none" }}>{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span><code style={{ paddingRight: 12, color: theme.text.primary, whiteSpace: "pre" }}><HighlightedLine content={line.content} language={resolvedLanguage} /></code></div>;
  })}</div>;
}

export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";
export interface TodoItem { readonly id: string; readonly content: string; readonly status: TodoStatus }
export type TodoListProps = { todos: readonly TodoItem[]; dimmedTodoIds?: ReadonlySet<string>; onTodoClick?: (todo: TodoItem) => void; style?: CSSProperties };
function TodoIcon({ status }: { status: TodoStatus }) {
  const theme = useHostTheme();
  if (status === "completed") return <Check size={14} color={theme.category.green} />;
  if (status === "in_progress") return <LoaderCircle size={14} color={theme.category.blue} />;
  if (status === "cancelled") return <Ban size={14} color={theme.text.quaternary} />;
  return <Circle size={12} color={theme.text.tertiary} />;
}
export function TodoList({ todos, dimmedTodoIds, onTodoClick, style }: TodoListProps) {
  const theme = useHostTheme();
  if (!todos.length) return null;
  return <div style={style}>{todos.map((todo) => <button key={todo.id} type="button" onClick={() => onTodoClick?.(todo)} style={{ display: "flex", width: "100%", alignItems: "flex-start", gap: 8, padding: "7px 4px", border: 0, borderBottom: `1px solid ${theme.stroke.tertiary}`, background: "transparent", color: theme.text.primary, textAlign: "left", cursor: onTodoClick ? "pointer" : "default", opacity: dimmedTodoIds?.has(todo.id) ? 0.4 : 1 }}><span style={{ paddingTop: 2 }}><TodoIcon status={todo.status} /></span><span style={{ fontSize: 13, lineHeight: "18px", textDecoration: todo.status === "completed" ? "line-through" : undefined }}>{todo.content}</span></button>)}</div>;
}

export type TodoListCardProps = TodoListProps & { defaultExpanded?: boolean };
export function TodoListCard({ todos, dimmedTodoIds, defaultExpanded = false, onTodoClick, style }: TodoListCardProps) {
  const theme = useHostTheme();
  const [open, setOpen] = useState(defaultExpanded);
  if (!todos.length) return null;
  const done = todos.filter((todo) => todo.status === "completed").length;
  return <section style={mergeStyle({ overflow: "hidden", border: `1px solid ${theme.stroke.tertiary}`, borderRadius: canvasRadius.lg }, style)}><button type="button" onClick={() => setOpen(!open)} style={{ display: "flex", width: "100%", alignItems: "center", gap: 7, padding: "8px 10px", border: 0, background: theme.bg.chrome, color: theme.text.secondary, cursor: "pointer" }}><CanvasChevron expanded={open} /><span style={{ flex: 1, textAlign: "left", fontSize: 12, fontWeight: 600 }}>Tasks</span><span style={{ fontSize: 11 }}>{done} of {todos.length} done</span></button>{open ? <TodoList todos={todos} dimmedTodoIds={dimmedTodoIds} onTodoClick={onTodoClick} /> : null}</section>;
}

export type CollapsibleSectionProps = { title: string; leading?: ReactNode; count?: number; trailing?: ReactNode; children?: ReactNode; defaultOpen?: boolean; style?: CSSProperties };
export function CollapsibleSection({ title, leading, count, trailing, children, defaultOpen = false, style }: CollapsibleSectionProps) {
  const theme = useHostTheme();
  const [open, setOpen] = useState(defaultOpen);
  return <section style={style}><div style={{ display: "flex", alignItems: "center", minHeight: 32 }}><button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ display: "flex", minWidth: 0, flex: 1, alignItems: "center", gap: 7, padding: "4px 2px", border: 0, background: "transparent", color: theme.text.secondary, cursor: "pointer", textAlign: "left" }}><CanvasChevron expanded={open} />{leading}<span style={{ color: theme.text.primary, fontSize: 13, fontWeight: 500 }}>{title}</span>{count === undefined ? null : <span style={{ color: theme.text.quaternary, fontSize: 11 }}>{count}</span>}</button>{trailing !== undefined && trailing !== null ? <span style={{ flexShrink: 0 }}>{trailing}</span> : null}</div>{open ? <div style={{ padding: "4px 0 8px 23px" }}>{children}</div> : null}</section>;
}

export interface UsageBarSegment { readonly id: string; readonly value: number; readonly color?: Color }
export type UsageBarProps = { readonly segments: readonly UsageBarSegment[]; readonly total: number; readonly topLeftLabel?: ReactNode; readonly topRightLabel?: ReactNode; readonly style?: CSSProperties };
export function UsageBar({ segments, total, topLeftLabel, topRightLabel, style }: UsageBarProps) {
  const theme = useHostTheme();
  const valid = segments.map((segment) => Math.max(0, Number.isFinite(segment.value) ? segment.value : 0));
  const denominator = Math.max(total, valid.reduce((sum, value) => sum + value, 0), 1);
  return <div style={style}>{topLeftLabel || topRightLabel ? <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: theme.text.tertiary, fontSize: 11 }}><span>{topLeftLabel}</span><span>{topRightLabel}</span></div> : null}<div style={{ display: "flex", height: 6, gap: 2, overflow: "hidden", borderRadius: 2, background: theme.fill.tertiary }}>{segments.map((segment, index) => <span key={segment.id} title={`${segment.id}: ${valid[index]}`} style={{ width: `${(valid[index] / denominator) * 100}%`, minWidth: valid[index] > 0 ? 2 : 0, background: theme.category[segment.color ?? usageColorSequence[index % usageColorSequence.length]] }} />)}</div></div>;
}

export type SwatchProps = { color: Color; style?: CSSProperties };
export function Swatch({ color, style }: SwatchProps) {
  const theme = useHostTheme();
  return <span aria-hidden style={mergeStyle({ display: "inline-block", width: 24, height: 24, flexShrink: 0, borderRadius: canvasRadius.sm, background: theme.category[color] }, style)} />;
}
