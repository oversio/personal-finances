"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { ChartTooltip } from "./chart-tooltip";

export interface HorizontalBarChartProps {
  /** Chart data array */
  data: Record<string, unknown>[];
  /** Key for category labels (Y axis) */
  categoryKey: string;
  /** Key for values (X axis) */
  valueKey: string;
  /** Bar color */
  color?: ChartColorKey | string;
  /** Chart height in pixels */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Bar corner radius */
  barRadius?: number;
  /** Bar size (height) */
  barSize?: number;
  /** Custom value formatter */
  valueFormatter?: (value: number) => string;
  /** Custom tooltip value formatter */
  tooltipValueFormatter?: (value: number | string) => string;
  /** Color each bar differently based on data index */
  colorByIndex?: boolean;
  /** Maximum category label width */
  labelWidth?: number;
}

/** Horizontal bar chart for ranked lists */
export function HorizontalBarChart({
  data,
  categoryKey,
  valueKey,
  color = "primary",
  height = 300,
  showGrid = true,
  barRadius = 4,
  barSize,
  valueFormatter,
  tooltipValueFormatter,
  colorByIndex = false,
  labelWidth = 100,
}: HorizontalBarChartProps) {
  const resolveColor = (c: ChartColorKey | string) => {
    if (c in CHART_COLORS) return getChartColor(c as ChartColorKey);
    return c;
  };

  const barColor = resolveColor(color);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.grid} horizontal={false} />
        )}

        <XAxis
          type="number"
          tick={{ fill: CHART_STYLES.axisText, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: CHART_STYLES.grid }}
          tickFormatter={valueFormatter}
        />

        <YAxis
          type="category"
          dataKey={categoryKey}
          tick={{ fill: CHART_STYLES.axisText, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={labelWidth}
        />

        <Tooltip
          cursor={{ fill: "hsl(var(--heroui-default-100))" }}
          content={
            <ChartTooltip
              valueFormatter={tooltipValueFormatter ?? (value => String(value))}
              nameResolver={() => String(valueKey)}
            />
          }
        />

        <Bar
          dataKey={valueKey}
          fill={barColor}
          radius={[0, barRadius, barRadius, 0]}
          barSize={barSize}
          animationDuration={ANIMATION_CONFIG.duration}
          animationEasing={ANIMATION_CONFIG.easing}
        >
          {colorByIndex &&
            data.map((_, index) => <Cell key={index} fill={getSeriesColor(index)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
