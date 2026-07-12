import {
  Children,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Info, TriangleAlert } from "lucide-react";
import { useHostTheme } from "./host";
import { canvasRadius, canvasTypography } from "./theme";

export function mergeStyle(base: CSSProperties, override?: CSSProperties): CSSProperties {
  return { ...base, ...override };
}

export type StackProps = { children?: ReactNode; gap?: number; style?: CSSProperties };
export function Stack({ children, gap = 12, style }: StackProps) {
  return <div style={mergeStyle({ display: "flex", flexDirection: "column", gap, minWidth: 0 }, style)}>{children}</div>;
}

export type RowProps = {
  children?: ReactNode;
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "space-between";
  wrap?: boolean;
  style?: CSSProperties;
};
const flexMap = { start: "flex-start", center: "center", end: "flex-end", stretch: "stretch", "space-between": "space-between" } as const;
export function Row({ children, gap = 8, align = "center", justify = "start", wrap, style }: RowProps) {
  return (
    <div style={mergeStyle({ display: "flex", gap, minWidth: 0, alignItems: flexMap[align], justifyContent: flexMap[justify], flexWrap: wrap ? "wrap" : "nowrap" }, style)}>
      {children}
    </div>
  );
}

export type GridProps = { children?: ReactNode; columns: number | string; gap?: number; align?: "start" | "center" | "end" | "stretch"; style?: CSSProperties };
export function Grid({ children, columns, gap = 12, align = "stretch", style }: GridProps) {
  return <div style={mergeStyle({ display: "grid", gridTemplateColumns: typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns, gap, alignItems: flexMap[align], minWidth: 0 }, style)}>{children}</div>;
}

export type DividerProps = { style?: CSSProperties };
export function Divider({ style }: DividerProps) {
  const theme = useHostTheme();
  return <div role="separator" style={mergeStyle({ height: 1, width: "100%", background: theme.stroke.tertiary }, style)} />;
}

export function Spacer() {
  return <span aria-hidden style={{ flex: 1 }} />;
}

export type TableColumnAlign = "left" | "center" | "right";
export type TableRowTone = "success" | "danger" | "warning" | "info" | "neutral";
export type TableProps = {
  headers: ReactNode[];
  rows: ReactNode[][];
  columnAlign?: Array<TableColumnAlign | undefined>;
  rowTone?: Array<TableRowTone | undefined>;
  framed?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  style?: CSSProperties;
  emptyMessage?: ReactNode;
};

function toneColor(theme: ReturnType<typeof useHostTheme>, tone?: string) {
  if (tone === "success") return theme.category.green;
  if (tone === "danger") return theme.category.red;
  if (tone === "warning") return theme.category.yellow;
  if (tone === "info") return theme.category.blue;
  return theme.text.tertiary;
}

export function Table({ headers, rows, columnAlign, rowTone, framed = true, striped, stickyHeader, style, emptyMessage = "No data" }: TableProps) {
  const theme = useHostTheme();
  const shell: CSSProperties = framed ? { border: `1px solid ${theme.stroke.tertiary}`, borderRadius: canvasRadius.lg } : {};
  return (
    <div style={mergeStyle({ overflowX: "auto", ...shell }, framed ? style : undefined)}>
      <table style={mergeStyle({ width: "100%", minWidth: Math.max(280, headers.length * 108), borderCollapse: "collapse", color: theme.text.primary, fontSize: 13 }, framed ? undefined : style)}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={{ position: stickyHeader ? "sticky" : undefined, top: 0, zIndex: 1, padding: "9px 12px", textAlign: columnAlign?.[index] ?? "left", fontWeight: 600, color: theme.text.secondary, background: theme.bg.chrome, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} style={{ padding: 18, textAlign: "center", color: theme.text.tertiary }}>{emptyMessage}</td></tr>
          ) : rows.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ background: striped && rowIndex % 2 === 1 ? theme.fill.quaternary : undefined }}>
              {headers.map((_, cellIndex) => (
                <td key={cellIndex} style={{ padding: "9px 12px", textAlign: columnAlign?.[cellIndex] ?? "left", borderBottom: rowIndex === rows.length - 1 ? undefined : `1px solid ${theme.stroke.tertiary}`, verticalAlign: "top" }}>
                  {cellIndex === 0 && rowTone?.[rowIndex] ? <div style={{ display: "grid", gridTemplateColumns: "6px minmax(0, 1fr)", alignItems: "center", gap: 7 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: toneColor(theme, rowTone[rowIndex]) }} />{row[cellIndex]}</div> : row[cellIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextProps = { children?: ReactNode; tone?: "primary" | "secondary" | "tertiary" | "quaternary"; size?: "body" | "small"; as?: "p" | "span"; weight?: TextWeight; italic?: boolean; truncate?: boolean | "start" | "end"; style?: CSSProperties };
const TypographyContext = createContext(false);
function inlineMarkdown(children: ReactNode): ReactNode {
  if (typeof children !== "string") {
    return Children.map(children, (child) => typeof child === "string" ? inlineMarkdown(child) : child);
  }
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = children.split(pattern);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <Code key={index}>{part.slice(1, -1)}</Code>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) return <Link key={index} href={link[2]}>{link[1]}</Link>;
    return part;
  });
}

export function Text({ children, tone = "primary", size = "body", as, weight = "normal", italic, truncate, style }: TextProps) {
  const theme = useHostTheme();
  const nested = useContext(TypographyContext);
  const Component = as ?? (nested ? "span" : "p");
  const weights = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  return <Component style={mergeStyle({ display: truncate ? "block" : undefined, minWidth: truncate ? 0 : undefined, margin: Component === "p" ? 0 : undefined, color: theme.text[tone], fontSize: canvasTypography[size].fontSize, lineHeight: canvasTypography[size].lineHeight, fontWeight: weights[weight], fontStyle: italic ? "italic" : undefined, whiteSpace: truncate ? "nowrap" : undefined, overflow: truncate ? "hidden" : undefined, textOverflow: truncate ? "ellipsis" : undefined, direction: truncate === "start" ? "rtl" : undefined, textAlign: truncate === "start" ? "left" : undefined, unicodeBidi: truncate === "start" ? "plaintext" : undefined }, style)}><TypographyContext.Provider value>{inlineMarkdown(children)}</TypographyContext.Provider></Component>;
}

function Heading({ level, children, style }: { level: 1 | 2 | 3; children?: ReactNode; style?: CSSProperties }) {
  const theme = useHostTheme();
  const Component = `h${level}` as "h1" | "h2" | "h3";
  const typography = level === 1 ? canvasTypography.h1 : level === 2 ? canvasTypography.h2 : canvasTypography.h3;
  return <Component style={mergeStyle({ margin: 0, color: theme.text.primary, letterSpacing: 0, ...typography }, style)}><TypographyContext.Provider value>{children}</TypographyContext.Provider></Component>;
}
export type H1Props = { children?: ReactNode; style?: CSSProperties };
export type H2Props = H1Props;
export type H3Props = H1Props;
export function H1(props: H1Props) { return <Heading level={1} {...props} />; }
export function H2(props: H2Props) { return <Heading level={2} {...props} />; }
export function H3(props: H3Props) { return <Heading level={3} {...props} />; }

export type CodeProps = { children?: ReactNode; style?: CSSProperties };
export function Code({ children, style }: CodeProps) {
  const theme = useHostTheme();
  return <code style={mergeStyle({ padding: "1px 4px", border: `1px solid ${theme.stroke.tertiary}`, borderRadius: 4, background: theme.fill.tertiary, color: theme.text.primary, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.92em" }, style)}>{children}</code>;
}

export type LinkProps = { children?: ReactNode; href: string; style?: CSSProperties };
export function Link({ children, href, style }: LinkProps) {
  const theme = useHostTheme();
  return <a href={href} target="_blank" rel="noreferrer" style={mergeStyle({ color: theme.text.link, textDecoration: "underline", textUnderlineOffset: 3 }, style)}>{children}</a>;
}

export function CanvasChevron({ expanded }: { expanded: boolean }) {
  return <ChevronRight aria-hidden size={14} style={{ transform: expanded ? "rotate(90deg)" : undefined, transition: "transform 120ms ease" }} />;
}

type CardContextValue = { open: boolean; collapsible: boolean; toggle: () => void; size: "base" | "lg"; stickyHeader: boolean };
const CardContext = createContext<CardContextValue>({ open: true, collapsible: false, toggle: () => {}, size: "base", stickyHeader: false });
export type CardSize = "base" | "lg";
export type CardVariant = "default" | "borderless";
export type CardProps = { children?: ReactNode; variant?: CardVariant; size?: CardSize; stickyHeader?: boolean; collapsible?: boolean; defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void; style?: CSSProperties };
export function Card({ children, variant = "default", size = "base", stickyHeader = false, collapsible = false, defaultOpen = true, open: controlled, onOpenChange, style }: CardProps) {
  const theme = useHostTheme();
  const [internal, setInternal] = useState(defaultOpen);
  const open = collapsible ? controlled ?? internal : true;
  const toggle = () => {
    if (!collapsible) return;
    const next = !open;
    if (controlled === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  return <CardContext.Provider value={{ open, collapsible, toggle, size, stickyHeader }}><section style={mergeStyle({ overflow: stickyHeader ? undefined : "hidden", border: variant === "default" ? `1px solid ${theme.stroke.tertiary}` : undefined, borderRadius: variant === "default" ? canvasRadius.lg : undefined, background: variant === "default" ? theme.bg.elevated : undefined }, style)}>{children}</section></CardContext.Provider>;
}

export type CardHeaderProps = { children?: ReactNode; trailing?: ReactNode; style?: CSSProperties };
export function CardHeader({ children, trailing, style }: CardHeaderProps) {
  const theme = useHostTheme();
  const context = useContext(CardContext);
  const content = <><span style={{ display: "inline-flex", minWidth: 0, alignItems: "center", gap: 6 }}>{context.collapsible ? <CanvasChevron expanded={context.open} /> : null}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span></span>{trailing !== undefined && trailing !== null ? <span style={{ flexShrink: 0 }}>{trailing}</span> : null}</>;
  const base: CSSProperties = { display: "flex", minHeight: context.size === "lg" ? 32 : 28, alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 12px", borderBottom: context.open ? `1px solid ${theme.stroke.tertiary}` : undefined, background: theme.bg.chrome, color: theme.text.secondary, fontSize: 12, fontWeight: 600, position: context.stickyHeader ? "sticky" : undefined, top: 0, zIndex: 2 };
  return context.collapsible ? <button type="button" aria-expanded={context.open} onClick={context.toggle} style={mergeStyle({ ...base, width: "100%", borderTop: 0, borderLeft: 0, borderRight: 0, cursor: "pointer", textAlign: "left" }, style)}>{content}</button> : <div style={mergeStyle(base, style)}>{content}</div>;
}

export type CardBodyProps = { children?: ReactNode; style?: CSSProperties };
export function CardBody({ children, style }: CardBodyProps) {
  const context = useContext(CardContext);
  if (!context.open) return null;
  return <div style={mergeStyle({ padding: context.size === "lg" ? 16 : 12 }, style)}>{children}</div>;
}

export type ButtonProps = { children?: ReactNode; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean; type?: "button" | "submit" | "reset"; style?: CSSProperties; onClick?: () => void };
export function Button({ children, variant = "secondary", disabled, type = "button", style, onClick }: ButtonProps) {
  const theme = useHostTheme();
  const variants = { primary: { background: theme.accent.control, color: theme.text.onAccent, borderColor: theme.accent.control }, secondary: { background: theme.fill.tertiary, color: theme.text.primary, borderColor: theme.stroke.primary }, ghost: { background: "transparent", color: theme.text.secondary, borderColor: "transparent" } };
  return <button type={type} disabled={disabled} onClick={onClick} style={mergeStyle({ display: "inline-flex", width: "fit-content", minHeight: 24, alignItems: "center", justifyContent: "center", padding: "2px 8px", border: "1px solid", borderRadius: canvasRadius.md, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontSize: 12, fontWeight: 500, ...variants[variant] }, style)}>{children}</button>;
}

export type PillTone = "neutral" | "added" | "deleted" | "renamed" | "success" | "warning" | "info";
export type PillSize = "sm" | "md";
export type PillProps = { children?: ReactNode; active?: boolean; tone?: PillTone; size?: PillSize; leadingContent?: ReactNode; keyboardHint?: string; disabled?: boolean; title?: string; style?: CSSProperties; onClick?: () => void };
export function Pill({ children, active, size = "md", leadingContent, keyboardHint, disabled, title, style, onClick }: PillProps) {
  const theme = useHostTheme();
  const pillStyle = mergeStyle({ display: "inline-flex", width: "fit-content", maxWidth: "100%", minHeight: size === "sm" ? 18 : 24, alignItems: "center", gap: 5, padding: size === "sm" ? "1px 6px" : "2px 9px", border: size === "sm" ? 0 : `1px solid ${active ? theme.stroke.primary : theme.stroke.secondary}`, borderRadius: canvasRadius.full, background: active ? theme.fill.primary : theme.fill.tertiary, color: active ? theme.text.primary : theme.text.secondary, fontSize: size === "sm" ? 10 : 12, cursor: onClick ? "pointer" : "default", opacity: disabled ? 0.5 : 1 }, style);
  const content = <>{leadingContent}{children}{keyboardHint ? <kbd style={{ color: theme.text.quaternary, fontSize: 9 }}>{keyboardHint}</kbd> : null}</>;
  return onClick ? <button type="button" title={title} disabled={disabled} onClick={onClick} style={pillStyle}>{content}</button> : <span title={title} style={pillStyle}>{content}</span>;
}

export type StatTone = "success" | "danger" | "warning" | "info";
export type StatProps = { value: ReactNode; label: string; tone?: StatTone; style?: CSSProperties };
export function Stat({ value, label, tone, style }: StatProps) {
  const theme = useHostTheme();
  return <div style={mergeStyle({ minWidth: 0 }, style)}><div style={{ color: tone ? toneColor(theme, tone) : theme.text.primary, fontSize: 24, lineHeight: "30px", fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>{value}</div><div style={{ color: theme.text.tertiary, fontSize: 12, lineHeight: "16px" }}>{label}</div></div>;
}

export type CalloutTone = "info" | "success" | "warning" | "danger" | "neutral";
export type CalloutProps = { children?: ReactNode; tone?: CalloutTone; title?: ReactNode; icon?: ReactNode; style?: CSSProperties };
export function Callout({ children, tone = "info", title, icon, style }: CalloutProps) {
  const theme = useHostTheme();
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? TriangleAlert : tone === "danger" ? AlertCircle : Info;
  const color = toneColor(theme, tone);
  return <div role="note" style={mergeStyle({ display: "flex", gap: 10, padding: 12, border: `1px solid ${theme.stroke.secondary}`, borderRadius: canvasRadius.lg, background: theme.fill.quaternary, color: theme.text.primary }, style)}><span style={{ color, flexShrink: 0, paddingTop: 1 }}>{icon ?? <Icon size={16} />}</span><div style={{ minWidth: 0, fontSize: 13, lineHeight: "19px" }}>{title !== undefined && title !== null ? <div style={{ marginBottom: 3, fontWeight: 600 }}>{title}</div> : null}{children}</div></div>;
}
