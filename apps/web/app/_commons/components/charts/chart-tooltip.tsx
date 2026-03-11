"use client";

import type { TooltipProps } from "recharts";

interface ChartTooltipContentProps {
  label?: string;
  items: Array<{
    name: string;
    value: string | number;
    color: string;
  }>;
  formatValue?: (value: string | number) => string;
}

/** Styled tooltip content matching HeroUI Popover design */
function ChartTooltipContent({ label, items, formatValue = String }: ChartTooltipContentProps) {
  return (
    <div className="rounded-lg border border-default-200 bg-content1 px-3 py-2 shadow-lg">
      {label && <p className="mb-1.5 text-xs font-medium text-default-500">{label}</p>}
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-default-700">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatValue(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type RechartsTooltipPayload = Array<{
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}>;

export interface ChartTooltipProps extends Omit<
  TooltipProps<number | string, string>,
  "content" | "formatter" | "labelFormatter"
> {
  /** Custom label formatter */
  labelFormatter?: (label: string) => string;
  /** Custom value formatter */
  valueFormatter?: (value: number | string) => string;
  /** Custom name resolver from payload */
  nameResolver?: (entry: RechartsTooltipPayload[number], index: number) => string;
}

/** Custom chart tooltip matching HeroUI design */
export function ChartTooltip({
  labelFormatter = label => label,
  valueFormatter = value => String(value),
  nameResolver = entry => entry.name ?? String(entry.dataKey ?? ""),
  ...props
}: ChartTooltipProps) {
  return (
    <CustomTooltipRenderer
      labelFormatter={labelFormatter}
      valueFormatter={valueFormatter}
      nameResolver={nameResolver}
      {...props}
    />
  );
}

/** Internal component that renders the tooltip content */
function CustomTooltipRenderer({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  nameResolver,
}: ChartTooltipProps & {
  active?: boolean;
  payload?: RechartsTooltipPayload;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload.map((entry, index) => ({
    name: nameResolver?.(entry, index) ?? String(entry.dataKey ?? ""),
    value: entry.value ?? 0,
    color: entry.color ?? "hsl(var(--heroui-default-500))",
  }));

  return (
    <ChartTooltipContent
      label={labelFormatter?.(String(label ?? ""))}
      items={items}
      formatValue={valueFormatter}
    />
  );
}

/** Props for creating a custom tooltip content renderer */
export interface CustomTooltipContentProps {
  active?: boolean;
  payload?: RechartsTooltipPayload;
  label?: string;
}

export { ChartTooltipContent };
