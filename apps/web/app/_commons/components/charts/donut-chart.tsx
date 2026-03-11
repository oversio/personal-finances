"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  ANIMATION_CONFIG,
  type ChartColorKey,
  getChartColor,
  getSeriesColor,
} from "./chart-colors";
import { ChartTooltip } from "./chart-tooltip";

export interface DonutChartCenterLabel {
  /** Main value to display */
  value: string;
  /** Subtitle below the value */
  subtitle?: string;
}

export interface DonutChartDataItem {
  /** Item name/label */
  name: string;
  /** Item value */
  value: number;
  /** Optional color override */
  color?: ChartColorKey | string;
}

export interface DonutChartProps {
  /** Chart data array */
  data: DonutChartDataItem[];
  /** Key for item names */
  nameKey?: string;
  /** Key for item values */
  valueKey?: string;
  /** Inner radius (percentage or pixels) */
  innerRadius?: string | number;
  /** Outer radius (percentage or pixels) */
  outerRadius?: string | number;
  /** Center label configuration */
  centerLabel?: DonutChartCenterLabel;
  /** Chart height in pixels */
  height?: number;
  /** Padding angle between segments */
  paddingAngle?: number;
  /** Custom tooltip value formatter */
  tooltipValueFormatter?: (value: number | string) => string;
  /** Corner radius for segments */
  cornerRadius?: number;
}

/** Donut/Pie chart for category breakdowns */
export function DonutChart({
  data,
  innerRadius = "60%",
  outerRadius = "90%",
  centerLabel,
  height = 300,
  paddingAngle = 2,
  tooltipValueFormatter,
  cornerRadius = 4,
}: DonutChartProps) {
  const resolveColor = (item: DonutChartDataItem, index: number) => {
    if (!item.color) return getSeriesColor(index);
    if (
      item.color === "primary" ||
      item.color === "success" ||
      item.color === "warning" ||
      item.color === "danger" ||
      item.color === "secondary" ||
      item.color === "default"
    ) {
      return getChartColor(item.color);
    }
    return item.color;
  };

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            cornerRadius={cornerRadius}
            animationDuration={ANIMATION_CONFIG.duration}
            animationEasing={ANIMATION_CONFIG.easing}
          >
            {data.map((item, index) => (
              <Cell key={index} fill={resolveColor(item, index)} />
            ))}
          </Pie>

          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={tooltipValueFormatter ?? (value => String(value))}
                nameResolver={entry => String(entry.name ?? "")}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{centerLabel.value}</span>
          {centerLabel.subtitle && (
            <span className="text-xs text-default-500">{centerLabel.subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
