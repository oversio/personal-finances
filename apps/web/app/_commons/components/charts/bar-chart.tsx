"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ANIMATION_CONFIG,
  CHART_COLORS,
  CHART_STYLES,
  type ChartColorKey,
  getChartColor,
  getSeriesColor,
} from "./chart-colors";
import { ChartLegend } from "./chart-legend";
import { ChartTooltip } from "./chart-tooltip";

export interface BarChartSeries {
  /** Data key to plot */
  key: string;
  /** Display label for legend/tooltip */
  label: string;
  /** Color key or custom color */
  color?: ChartColorKey | string;
}

export interface BarChartProps {
  /** Chart data array */
  data: Record<string, unknown>[];
  /** Key for X axis categories */
  xKey: string;
  /** Series configuration (for multi-series) */
  series?: BarChartSeries[];
  /** Single Y key (for simple single-bar charts) */
  yKey?: string;
  /** Single color for simple charts */
  color?: ChartColorKey | string;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend (for multi-series) */
  showLegend?: boolean;
  /** Bar corner radius */
  barRadius?: number;
  /** Bar size (width) */
  barSize?: number;
  /** Custom X axis formatter */
  xAxisFormatter?: (value: string) => string;
  /** Custom Y axis formatter */
  yAxisFormatter?: (value: number) => string;
  /** Custom tooltip value formatter */
  tooltipValueFormatter?: (value: number | string) => string;
  /** Show stacked bars */
  stacked?: boolean;
  /** Color each bar differently based on data index */
  colorByIndex?: boolean;
}

/** Vertical bar chart for category comparisons */
export function BarChart({
  data,
  xKey,
  series,
  yKey,
  color = "primary",
  height = 300,
  showGrid = true,
  showLegend = false,
  barRadius = 4,
  barSize,
  xAxisFormatter,
  yAxisFormatter,
  tooltipValueFormatter,
  stacked = false,
  colorByIndex = false,
}: BarChartProps) {
  const resolveColor = (c: ChartColorKey | string | undefined, index: number) => {
    if (!c) return getSeriesColor(index);
    if (c in CHART_COLORS) return getChartColor(c as ChartColorKey);
    return c;
  };

  const isSingleSeries = !series && yKey;
  const effectiveSeries: BarChartSeries[] =
    series ?? (yKey ? [{ key: yKey, label: yKey, color }] : []);

  const legendPayload = effectiveSeries.map((s, index) => ({
    value: s.label,
    color: resolveColor(s.color, index),
    dataKey: s.key,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.grid} vertical={false} />
        )}

        <XAxis
          dataKey={xKey}
          tick={{ fill: CHART_STYLES.axisText, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART_STYLES.grid }}
          tickFormatter={xAxisFormatter}
        />

        <YAxis
          tick={{ fill: CHART_STYLES.axisText, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yAxisFormatter}
          width={60}
        />

        <Tooltip
          cursor={{ fill: "hsl(var(--heroui-default-100))" }}
          content={
            <ChartTooltip
              labelFormatter={xAxisFormatter ?? (label => label)}
              valueFormatter={tooltipValueFormatter ?? (value => String(value))}
              nameResolver={(entry, index) => {
                if (isSingleSeries) return String(yKey);
                return effectiveSeries[index]?.label ?? String(entry.dataKey);
              }}
            />
          }
        />

        {showLegend && !isSingleSeries && (
          <Legend content={<ChartLegend payload={legendPayload} />} />
        )}

        {effectiveSeries.map((s, index) => {
          const barColor = resolveColor(s.color, index);
          return (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={barColor}
              radius={[barRadius, barRadius, 0, 0]}
              barSize={barSize}
              stackId={stacked ? "stack" : undefined}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing}
            >
              {colorByIndex &&
                isSingleSeries &&
                data.map((_, i) => <Cell key={i} fill={getSeriesColor(i)} />)}
            </Bar>
          );
        })}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
