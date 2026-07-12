import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { useHostTheme } from "./host";
import { canvasRadius } from "./theme";
import { mergeStyle } from "./primitives";

const controlBase = (theme: ReturnType<typeof useHostTheme>): CSSProperties => ({
  minHeight: 30,
  border: `1px solid ${theme.stroke.secondary}`,
  borderRadius: canvasRadius.md,
  outline: "none",
  background: theme.fill.tertiary,
  color: theme.text.primary,
  fontSize: 13,
});

export type TextInputProps = { value?: string; onChange?: (value: string) => void; placeholder?: string; disabled?: boolean; type?: "text" | "email" | "password" | "number" | "search" | "url"; style?: CSSProperties };
export function TextInput({ value, onChange, placeholder, disabled, type = "text", style }: TextInputProps) {
  const theme = useHostTheme();
  return <input type={type} value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} disabled={disabled} style={mergeStyle({ ...controlBase(theme), width: "100%", padding: "5px 9px" }, style)} />;
}

export type TextAreaProps = { value?: string; onChange?: (value: string) => void; placeholder?: string; disabled?: boolean; rows?: number; style?: CSSProperties };
export function TextArea({ value, onChange, placeholder, disabled, rows = 3, style }: TextAreaProps) {
  const theme = useHostTheme();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current || style?.height) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value, style?.height]);
  return <textarea ref={ref} value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} disabled={disabled} rows={rows} style={mergeStyle({ ...controlBase(theme), width: "100%", resize: "vertical", padding: "7px 9px", lineHeight: "19px" }, style)} />;
}

export type CheckboxProps = { checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; label?: ReactNode; style?: CSSProperties };
export function Checkbox({ checked, onChange, disabled, label, style }: CheckboxProps) {
  const theme = useHostTheme();
  return <label style={mergeStyle({ display: "inline-flex", alignItems: "center", gap: 8, color: theme.text.primary, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }, style)}><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange?.(event.target.checked)} disabled={disabled} style={{ width: 15, height: 15, accentColor: theme.accent.control }} />{label}</label>;
}

export type ToggleProps = { checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; size?: "sm" | "md"; style?: CSSProperties };
export function Toggle({ checked, onChange, disabled, size = "sm", style }: ToggleProps) {
  const theme = useHostTheme();
  const height = size === "md" ? 20 : 16;
  const width = size === "md" ? 34 : 28;
  const knob = height - 4;
  return <button type="button" role="switch" aria-checked={Boolean(checked)} disabled={disabled} onClick={() => onChange?.(!checked)} style={mergeStyle({ position: "relative", width, height, flexShrink: 0, padding: 0, border: `1px solid ${checked ? theme.accent.control : theme.stroke.primary}`, borderRadius: 999, background: checked ? theme.accent.control : theme.fill.secondary, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }, style)}><span style={{ position: "absolute", top: 1, left: checked ? width - knob - 3 : 2, width: knob, height: knob, borderRadius: "50%", background: checked ? theme.text.onAccent : theme.text.secondary, transition: "left 120ms ease" }} /></button>;
}

export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectProps = { value?: string; onChange?: (value: string) => void; options: SelectOption[]; placeholder?: string; disabled?: boolean; style?: CSSProperties };
export function Select({ value, onChange, options, placeholder, disabled, style }: SelectProps) {
  const theme = useHostTheme();
  return <select value={value ?? ""} onChange={(event) => onChange?.(event.target.value)} disabled={disabled} style={mergeStyle({ ...controlBase(theme), minWidth: 140, padding: "4px 26px 4px 8px" }, style)}>{placeholder ? <option value="" disabled>{placeholder}</option> : null}{options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>;
}

export type IconButtonProps = { children: ReactNode; onClick?: () => void; disabled?: boolean; title?: string; variant?: "default" | "circle"; size?: "sm" | "md"; style?: CSSProperties };
export function IconButton({ children, onClick, disabled, title, variant = "default", size = "md", style }: IconButtonProps) {
  const theme = useHostTheme();
  const dimension = size === "sm" ? 20 : 26;
  return <button type="button" onClick={onClick} disabled={disabled} title={title} aria-label={title} style={mergeStyle({ display: "inline-grid", width: dimension, height: dimension, placeItems: "center", padding: 0, border: variant === "circle" ? `1px solid ${theme.stroke.secondary}` : "1px solid transparent", borderRadius: variant === "circle" ? "50%" : canvasRadius.sm, background: variant === "circle" ? theme.fill.tertiary : "transparent", color: theme.text.secondary, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }, style)}>{children}</button>;
}
