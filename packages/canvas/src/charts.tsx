import { type CSSProperties, useState } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useHostTheme } from "./host";
import { chartColorSequence } from "./theme";

export type ChartTone = "success" | "danger" | "warning" | "info" | "neutral";
export type ChartDataPoint = { label: string; value: number };
export type ChartSeries = { name: string; data: number[]; tone?: ChartTone };
export type ChartReferenceLine = { value: number; label?: string; tone?: ChartTone };
type ValueAxisProps = { beginAtZero?: boolean; yMin?: number; yMax?: number; referenceLines?: ChartReferenceLine[] };
export type BarChartProps = ValueAxisProps & { categories: string[]; series: ChartSeries[]; height?: number; stacked?: boolean; horizontal?: boolean; normalized?: boolean; valueSuffix?: string; valuePrefix?: string; showValues?: boolean; style?: CSSProperties };
export type LineChartProps = ValueAxisProps & { categories: string[]; series: ChartSeries[]; height?: number; fill?: boolean; valueSuffix?: string; valuePrefix?: string; showValues?: boolean; showHoverGuide?: boolean; style?: CSSProperties };
export type PieChartProps = { data: Array<ChartDataPoint & { tone?: ChartTone }>; size?: number; donut?: boolean; style?: CSSProperties };

function semanticColor(theme: ReturnType<typeof useHostTheme>, tone?: ChartTone, index = 0) {
  if (tone === "success") return theme.category.green;
  if (tone === "danger") return theme.category.red;
  if (tone === "warning") return theme.category.yellow;
  if (tone === "info") return theme.category.blue;
  if (tone === "neutral") return theme.category.gray;
  return chartColorSequence[index % chartColorSequence.length];
}

function chartData(categories: string[], series: ChartSeries[], normalized = false) {
  return categories.map((category, index) => {
    const values = series.map((item) => {
      const value = Number(item.data[index] ?? 0);
      const finite = Number.isFinite(value) ? value : 0;
      return normalized ? Math.max(0, finite) : finite;
    });
    const total = values.reduce((sum, value) => sum + value, 0);
    return Object.fromEntries([["category", category], ...series.map((item, seriesIndex) => [item.name, normalized && total > 0 ? values[seriesIndex] / total * 100 : values[seriesIndex]])]);
  });
}

function tooltipStyle(theme: ReturnType<typeof useHostTheme>): CSSProperties {
  return { border: `1px solid ${theme.stroke.secondary}`, borderRadius: 6, background: theme.bg.elevated, color: theme.text.primary, fontSize: 12 };
}

function lineDomain(series: ChartSeries[], references: ChartReferenceLine[], beginAtZero: boolean, yMin?: number, yMax?: number): [number, number] {
  const values = [...series.flatMap((item) => item.data), ...references.map((line) => line.value)].filter(Number.isFinite);
  const minimum = values.length ? Math.min(...values) : 0;
  const maximum = values.length ? Math.max(...values) : 1;
  const span = Math.max(1, maximum - minimum);
  return [yMin ?? (beginAtZero ? Math.min(0, minimum) : minimum - span * 0.05), yMax ?? Math.max(0, maximum) + span * 0.05];
}

function barDomain(categories: string[], series: ChartSeries[], references: ChartReferenceLine[], stacked: boolean, normalized: boolean, beginAtZero: boolean, yMin?: number, yMax?: number): [number, number] {
  if (normalized) return [0, 100];
  const categoryValues = categories.map((_, index) => {
    const values = series.map((item) => Number(item.data[index] ?? 0));
    return stacked ? values.reduce((sum, value) => sum + value, 0) : Math.max(...values, 0);
  });
  const maximum = Math.max(...categoryValues, ...references.map((line) => line.value), 1);
  const minimum = Math.min(...series.flatMap((item) => item.data), ...references.map((line) => line.value), 0);
  if (stacked) return [0, maximum * 1.05];
  return [yMin ?? (beginAtZero ? Math.min(0, minimum) : minimum), yMax ?? maximum * 1.05];
}

export function BarChart({ categories, series, height = 260, stacked = false, horizontal, normalized = false, valueSuffix = "", valuePrefix = "", showValues, beginAtZero = true, yMin, yMax, referenceLines = [], style }: BarChartProps) {
  const theme = useHostTheme();
  const data = chartData(categories, series, normalized);
  const domain = barDomain(categories, series, referenceLines, stacked, normalized, beginAtZero, yMin, yMax);
  const valueFormatter = (value: unknown) => `${normalized ? "" : valuePrefix}${Number(value).toLocaleString()}${normalized ? "%" : valueSuffix}`;
  const labels = !stacked && !normalized && (showValues ?? (series.length === 1 && categories.length <= 8));
  return <div style={{ width: "100%", height, minWidth: 0, ...style }}><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: labels ? 24 : 12, right: 16, bottom: 4, left: 4 }}><CartesianGrid stroke={theme.stroke.tertiary} vertical={!horizontal} horizontal={horizontal} /><XAxis type={horizontal ? "number" : "category"} dataKey={horizontal ? undefined : "category"} domain={horizontal ? domain : undefined} tick={{ fill: theme.text.tertiary, fontSize: 11 }} axisLine={{ stroke: theme.stroke.secondary }} tickLine={false} tickFormatter={horizontal ? valueFormatter : undefined} /><YAxis type={horizontal ? "category" : "number"} dataKey={horizontal ? "category" : undefined} domain={horizontal ? undefined : domain} tick={{ fill: theme.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={!horizontal ? valueFormatter : undefined} width={horizontal ? 90 : 48} /><Tooltip contentStyle={tooltipStyle(theme)} formatter={(value) => valueFormatter(value)} />{series.length >= 2 ? <Legend wrapperStyle={{ color: theme.text.secondary, fontSize: 11 }} /> : null}{referenceLines.map((line, index) => horizontal ? <ReferenceLine key={index} x={line.value} ifOverflow="extendDomain" stroke={semanticColor(theme, line.tone)} strokeDasharray="4 4" label={line.label} /> : <ReferenceLine key={index} y={line.value} ifOverflow="extendDomain" stroke={semanticColor(theme, line.tone)} strokeDasharray="4 4" label={line.label} />)}{series.map((item, index) => <Bar key={item.name} dataKey={item.name} stackId={stacked || normalized ? "stack" : undefined} fill={semanticColor(theme, item.tone, index)} radius={stacked || normalized ? 0 : 2}>{series.length === 1 && !item.tone ? categories.map((category, categoryIndex) => <Cell key={category} fill={semanticColor(theme, undefined, categoryIndex)} />) : null}{labels ? <LabelList position={horizontal ? "right" : "top"} formatter={valueFormatter} fill={theme.text.secondary} fontSize={10} /> : null}</Bar>)}</RechartsBarChart></ResponsiveContainer></div>;
}

export function LineChart({ categories, series, height = 260, fill = false, valueSuffix = "", valuePrefix = "", showValues = false, showHoverGuide = true, beginAtZero = true, yMin, yMax, referenceLines = [], style }: LineChartProps) {
  const theme = useHostTheme();
  const data = chartData(categories, series);
  const formatter = (value: unknown) => `${valuePrefix}${Number(value).toLocaleString()}${valueSuffix}`;
  const domain = lineDomain(series, referenceLines, beginAtZero, yMin, yMax);
  const Chart = fill ? RechartsAreaChart : RechartsLineChart;
  return <div style={{ width: "100%", height, minWidth: 0, ...style }}><ResponsiveContainer width="100%" height="100%"><Chart data={data} margin={{ top: showValues ? 24 : 12, right: 18, bottom: 4, left: 4 }}><CartesianGrid stroke={theme.stroke.tertiary} vertical={false} /><XAxis dataKey="category" tick={{ fill: theme.text.tertiary, fontSize: 11 }} axisLine={{ stroke: theme.stroke.secondary }} tickLine={false} /><YAxis domain={domain} tick={{ fill: theme.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatter} width={52} /><Tooltip cursor={showHoverGuide ? { stroke: theme.stroke.primary } : false} contentStyle={tooltipStyle(theme)} formatter={(value) => formatter(value)} />{series.length >= 2 ? <Legend wrapperStyle={{ color: theme.text.secondary, fontSize: 11 }} /> : null}{referenceLines.map((line, index) => <ReferenceLine key={index} y={line.value} ifOverflow="extendDomain" stroke={semanticColor(theme, line.tone)} strokeDasharray="4 4" label={line.label} />)}{series.map((item, index) => fill ? <Area key={item.name} type="monotone" dataKey={item.name} stroke={semanticColor(theme, item.tone, index)} fill={semanticColor(theme, item.tone, index)} fillOpacity={0.12} strokeWidth={2} dot={{ r: 3 }}>{showValues && categories.length <= 20 ? <LabelList position="top" formatter={formatter} fill={theme.text.secondary} fontSize={10} /> : null}</Area> : <Line key={item.name} type="monotone" dataKey={item.name} stroke={semanticColor(theme, item.tone, index)} strokeWidth={2} dot={{ r: 3 }}>{showValues && categories.length <= 20 ? <LabelList position="top" formatter={formatter} fill={theme.text.secondary} fontSize={10} /> : null}</Line>)}</Chart></ResponsiveContainer></div>;
}

export function PieChart({ data, size = 200, donut, style }: PieChartProps) {
  const theme = useHostTheme();
  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const safeData = data.map((item) => ({ ...item, value: Math.max(0, Number.isFinite(item.value) ? item.value : 0) }));
  const total = safeData.reduce((sum, item) => sum + item.value, 0);
  return <div style={{ position: "relative", width: "100%", height: size + 48, ...style }}><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={safeData} dataKey="value" nameKey="label" cx="50%" cy="43%" outerRadius={Math.max(8, size / 2 - 4)} innerRadius={donut ? size * 0.28 : 0} paddingAngle={1} activeIndex={activeIndex} onMouseEnter={(_, index) => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(undefined)}>{safeData.map((item, index) => <Cell key={item.label} fill={semanticColor(theme, item.tone, index)} opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.4} />)}</Pie><Tooltip contentStyle={tooltipStyle(theme)} formatter={(value) => { const numeric = Number(value); const percentage = total > 0 ? numeric / total * 100 : 0; return `${numeric.toLocaleString()} (${percentage.toFixed(1)}%)`; }} /><Legend wrapperStyle={{ color: theme.text.secondary, fontSize: 11 }} onMouseEnter={(entry) => setActiveIndex(safeData.findIndex((item) => item.label === entry.value))} onMouseLeave={() => setActiveIndex(undefined)} /></RechartsPieChart></ResponsiveContainer>{donut ? <div style={{ position: "absolute", top: "43%", left: "50%", transform: "translate(-50%, -50%)", color: theme.text.primary, fontSize: 18, fontWeight: 650 }}>{total.toLocaleString()}</div> : null}</div>;
}
