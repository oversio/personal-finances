"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart as RechartsRadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { ANIMATION_CONFIG, type ChartColorKey, getChartColor } from "./chart-colors";

export interface RadialBarChartProps {
  /** Current value (0-100 for percentage, or actual value) */
  value: number;
  /** Maximum value (defaults to 100 for percentage) */
  maxValue?: number;
  /** Color for the filled portion */
  color?: ChartColorKey | string;
  /** Background track color */
  trackColor?: string;
  /** Chart size in pixels */
  size?: number;
  /** Bar thickness */
  barThickness?: number;
  /** Center label */
  centerLabel?: {
    value: string;
    subtitle?: string;
  };
  /** Start angle (default: 90 = top) */
  startAngle?: number;
  /** End angle (default: -270 = full circle) */
  endAngle?: number;
  /** Corner radius for bar */
  cornerRadius?: number;
}

/** Radial bar chart for single metric progress display */
export function RadialBarChart({
  value,
  maxValue = 100,
  color = "primary",
  trackColor = "hsl(var(--heroui-default-200))",
  size = 200,
  barThickness = 12,
  centerLabel,
  startAngle = 90,
  endAngle = -270,
  cornerRadius = 10,
}: RadialBarChartProps) {
  const resolveColor = (c: ChartColorKey | string) => {
    if (
      c === "primary" ||
      c === "success" ||
      c === "warning" ||
      c === "danger" ||
      c === "secondary" ||
      c === "default"
    ) {
      return getChartColor(c);
    }
    return c;
  };

  const fillColor = resolveColor(color);
  const percentage = Math.min((value / maxValue) * 100, 100);

  const data = [{ value: percentage, fill: fillColor }];

  const innerRadius = size / 2 - barThickness - 10;
  const outerRadius = size / 2 - 10;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          barSize={barThickness}
          data={data}
          startAngle={startAngle}
          endAngle={endAngle}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />

          {/* Background track */}
          <RadialBar
            background={{ fill: trackColor }}
            dataKey="value"
            cornerRadius={cornerRadius}
            animationDuration={ANIMATION_CONFIG.duration}
            animationEasing={ANIMATION_CONFIG.easing}
          />
        </RechartsRadialBarChart>
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
