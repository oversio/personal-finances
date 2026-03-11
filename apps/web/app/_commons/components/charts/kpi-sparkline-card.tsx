"use client";

import { Card, CardBody } from "@heroui/react";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "@repo/ui/icons";
import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { ANIMATION_CONFIG, type ChartColorKey, getChartColor } from "./chart-colors";

export interface KpiSparklineCardProps {
  /** Main title (e.g., stock symbol, metric name) */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Primary value to display */
  value: string | number;
  /** Trend percentage (positive = up, negative = down) */
  trendValue?: number;
  /** Sparkline data - array of values */
  sparklineData?: number[];
  /** Color theme - auto-detects from trend if not specified */
  color?: ChartColorKey | "auto";
  /** Whether up is good (green) or bad (red) */
  upIsGood?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional actions menu content */
  actions?: React.ReactNode;
}

/** KPI card with embedded sparkline chart (stock-ticker style) */
export function KpiSparklineCard({
  title,
  subtitle,
  value,
  trendValue,
  sparklineData = [],
  color = "auto",
  upIsGood = true,
  className,
  actions,
}: KpiSparklineCardProps) {
  const getTrendDirection = (): "up" | "down" | "neutral" => {
    if (trendValue === undefined || trendValue === 0) return "neutral";
    return trendValue > 0 ? "up" : "down";
  };

  const direction = getTrendDirection();

  const getColorKey = (): ChartColorKey => {
    if (color !== "auto") return color;
    if (direction === "neutral") return "default";
    if (direction === "up") return upIsGood ? "success" : "danger";
    return upIsGood ? "danger" : "success";
  };

  const colorKey = getColorKey();
  const chartColor = getChartColor(colorKey);

  const getTrendBgColor = () => {
    switch (colorKey) {
      case "success":
        return "bg-success/20 text-success";
      case "danger":
        return "bg-danger/20 text-danger";
      case "warning":
        return "bg-warning/20 text-warning";
      default:
        return "bg-default-200 text-default-600";
    }
  };

  const TrendIcon =
    direction === "up" ? ChevronUpIcon : direction === "down" ? ChevronDownIcon : MinusIcon;

  // Generate unique gradient ID (SVG IDs can't have spaces)
  const gradientId = useId().replace(/:/g, "");

  // Transform sparkline data to chart format
  const chartData = sparklineData.map((val, index) => ({ index, value: val }));

  return (
    <Card className={className} shadow="sm" classNames={{ base: "bg-content1 overflow-hidden" }}>
      <CardBody className="gap-1 p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-default-500">{subtitle}</p>}
          </div>
          {actions && <div className="text-default-400">{actions}</div>}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {trendValue !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${getTrendBgColor()}`}
            >
              <TrendIcon className="size-3" />
              {Math.abs(trendValue).toFixed(1)}%
            </span>
          )}
        </div>
      </CardBody>

      {chartData.length > 0 && (
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sparkline-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#sparkline-${gradientId})`}
                animationDuration={ANIMATION_CONFIG.duration}
                animationEasing={ANIMATION_CONFIG.easing}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
