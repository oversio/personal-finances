/**
 * Chart color palette using HeroUI design tokens.
 * Colors are defined as CSS custom property references for dark mode support.
 */

export const CHART_COLORS = {
  primary: "hsl(var(--heroui-primary))",
  secondary: "hsl(var(--heroui-secondary))",
  success: "hsl(var(--heroui-success))",
  warning: "hsl(var(--heroui-warning))",
  danger: "hsl(var(--heroui-danger))",
  default: "hsl(var(--heroui-default-500))",
} as const;

/** Extended palette for multi-series charts */
export const CHART_SERIES_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.secondary,
  CHART_COLORS.danger,
] as const;

/** Chart styling constants */
export const CHART_STYLES = {
  grid: "hsl(var(--heroui-default-200))",
  axisText: "hsl(var(--heroui-default-500))",
  background: "transparent",
} as const;

/** Animation configuration matching HeroUI Pro */
export const ANIMATION_CONFIG = {
  duration: 1000,
  easing: "ease" as const,
};

/** Color key type for semantic color selection */
export type ChartColorKey = keyof typeof CHART_COLORS;

/** Get chart color by key */
export function getChartColor(key: ChartColorKey): string {
  return CHART_COLORS[key];
}

/** Get color from series palette by index */
export function getSeriesColor(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] as string;
}
