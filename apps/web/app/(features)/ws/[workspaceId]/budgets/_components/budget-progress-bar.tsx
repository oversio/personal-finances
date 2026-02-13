"use client";

import { Progress } from "@heroui/react";

interface BudgetProgressBarProps {
  percentage: number;
  alertThreshold?: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getProgressColor(
  percentage: number,
  alertThreshold?: number | null,
): "success" | "primary" | "warning" | "danger" {
  if (percentage >= 100) return "danger";
  if (alertThreshold && percentage >= alertThreshold) return "warning";
  if (percentage >= 50) return "primary";
  return "success";
}

export function BudgetProgressBar({
  percentage,
  alertThreshold,
  size = "md",
  showLabel = true,
}: BudgetProgressBarProps) {
  const color = getProgressColor(percentage, alertThreshold);
  const displayPercentage = Math.min(percentage, 100);

  return (
    <Progress
      aria-label="Budget progress"
      value={displayPercentage}
      color={color}
      size={size}
      showValueLabel={showLabel}
      classNames={{
        value: "text-foreground/60",
      }}
    />
  );
}
