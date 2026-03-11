"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
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

export interface AreaChartSeries {
  /** Data key to plot */
  key: string;
  /** Display label for legend/tooltip */
  label: string;
  /** Color key or custom color */
  color?: ChartColorKey | string;
}

export interface AreaChartProps {
  /** Chart data array */
  data: Record<string, unknown>[];
  /** Key for X axis values */
  xKey: string;
  /** Series configuration */
  series: AreaChartSeries[];
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Custom X axis formatter */
  xAxisFormatter?: (value: string) => string;
  /** Custom Y axis formatter */
  yAxisFormatter?: (value: number) => string;
  /** Custom tooltip value formatter */
  tooltipValueFormatter?: (value: number | string) => string;
  /** Curve type for area */
  curveType?: "monotone" | "linear" | "step";
  /** Fill opacity for area */
  fillOpacity?: number;
  /** Show stacked areas */
  stacked?: boolean;
}

/** Area/Line chart for trends over time */
export function AreaChart({
  data,
  xKey,
  series,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisFormatter,
  yAxisFormatter,
  tooltipValueFormatter,
  curveType = "monotone",
  fillOpacity = 0.3,
  stacked = false,
}: AreaChartProps) {
  const resolveColor = (color: ChartColorKey | string | undefined, index: number) => {
    if (!color) return getSeriesColor(index);
    if (color in CHART_COLORS) return getChartColor(color as ChartColorKey);
    return color;
  };

  const legendPayload = series.map((s, index) => ({
    value: s.label,
    color: resolveColor(s.color, index),
    dataKey: s.key,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, index) => {
            const color = resolveColor(s.color, index);
            return (
              <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            );
          })}
        </defs>

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
          content={
            <ChartTooltip
              labelFormatter={xAxisFormatter ?? (label => label)}
              valueFormatter={tooltipValueFormatter ?? (value => String(value))}
              nameResolver={(entry, index) => series[index]?.label ?? String(entry.dataKey)}
            />
          }
        />

        {showLegend && <Legend content={<ChartLegend payload={legendPayload} />} />}

        {series.map((s, index) => {
          const color = resolveColor(s.color, index);
          return (
            <Area
              key={s.key}
              type={curveType}
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${s.key})`}
              stackId={stacked ? "stack" : undefined}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing}
            />
          );
        })}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
