"use client";

import { Card, CardBody } from "@heroui/react";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "@repo/ui/icons";
import type { ReactNode } from "react";

export interface KpiCardTrend {
  /** Trend value (e.g., 12.5 for +12.5%) */
  value: number;
  /** Trend direction - auto-detects from value if not specified */
  direction?: "up" | "down" | "neutral";
  /** Label for the trend (e.g., "vs last month") */
  label?: string;
  /** Whether up is good (green) or bad (red) */
  upIsGood?: boolean;
}

export interface KpiCardProps {
  /** Main label/title */
  label: string;
  /** Primary value to display */
  value: string | number;
  /** Optional icon */
  icon?: ReactNode;
  /** Trend indicator */
  trend?: KpiCardTrend;
  /** Additional description */
  description?: string;
  /** Card variant */
  variant?: "flat" | "bordered" | "shadow";
  /** Additional CSS classes */
  className?: string;
}

/** Large KPI stat card with trend indicator */
export function KpiCard({
  label,
  value,
  icon,
  trend,
  description,
  variant = "shadow",
  className,
}: KpiCardProps) {
  const getTrendDirection = (): "up" | "down" | "neutral" => {
    if (trend?.direction) return trend.direction;
    if (!trend) return "neutral";
    if (trend.value > 0) return "up";
    if (trend.value < 0) return "down";
    return "neutral";
  };

  const direction = getTrendDirection();
  const upIsGood = trend?.upIsGood ?? true;

  const getTrendColor = () => {
    if (direction === "neutral") return "text-default-500";
    if (direction === "up") return upIsGood ? "text-success" : "text-danger";
    return upIsGood ? "text-danger" : "text-success";
  };

  const TrendIcon =
    direction === "up" ? ChevronUpIcon : direction === "down" ? ChevronDownIcon : MinusIcon;

  const cardProps = {
    flat: { shadow: "none" as const, classNames: { base: "bg-default-100" } },
    bordered: { shadow: "none" as const, classNames: { base: "border border-default-200" } },
    shadow: { shadow: "sm" as const },
  }[variant];

  return (
    <Card className={className} {...cardProps}>
      <CardBody className="gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-default-500">{label}</span>
          {icon && <div className="rounded-lg bg-default-100 p-2 text-default-600">{icon}</div>}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          {trend && (
            <div className={`flex items-center gap-0.5 pb-1 ${getTrendColor()}`}>
              <TrendIcon className="size-4" />
              <span className="text-sm font-medium">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {(trend?.label ?? description) && (
          <p className="text-xs text-default-500">{trend?.label ?? description}</p>
        )}
      </CardBody>
    </Card>
  );
}
