"use client";

import type { LegendProps } from "recharts";

interface LegendItem {
  value: string;
  color: string;
  dataKey?: string;
}

interface ChartLegendContentProps {
  items: LegendItem[];
  align?: "left" | "center" | "right";
}

/** Styled legend content matching HeroUI design */
function ChartLegendContent({ items, align = "center" }: ChartLegendContentProps) {
  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  return (
    <div className={`flex flex-wrap gap-4 px-2 pt-3 ${alignmentClass}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-default-600">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

type RechartsLegendPayload = Array<{
  value: string;
  color?: string;
  dataKey?: string | number;
  type?: string;
}>;

export interface ChartLegendProps extends Omit<LegendProps, "content"> {
  /** Horizontal alignment of legend items */
  align?: "left" | "center" | "right";
  /** Legend payload (passed by Recharts) */
  payload?: RechartsLegendPayload;
}

/** Custom chart legend matching HeroUI design */
export function ChartLegend({ align = "center", payload }: ChartLegendProps) {
  return <CustomLegendRenderer align={align} payload={payload ?? []} />;
}

/** Internal component that renders the legend content */
function CustomLegendRenderer({
  payload,
  align,
}: {
  payload: RechartsLegendPayload;
  align: "left" | "center" | "right";
}) {
  if (!payload?.length) {
    return null;
  }

  const items: LegendItem[] = payload.map(entry => ({
    value: entry.value,
    color: entry.color ?? "hsl(var(--heroui-default-500))",
    dataKey: String(entry.dataKey ?? ""),
  }));

  return <ChartLegendContent items={items} align={align} />;
}

export { ChartLegendContent };
