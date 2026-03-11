"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import type { ReactNode } from "react";

export interface ChartContainerProps {
  /** Chart title */
  title?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Chart content */
  children: ReactNode;
  /** Optional actions/filters to display in header */
  headerActions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show card border */
  bordered?: boolean;
}

/** Card wrapper for chart components with optional header */
export function ChartContainer({
  title,
  subtitle,
  children,
  headerActions,
  className,
  bordered = true,
}: ChartContainerProps) {
  const hasHeader = title ?? subtitle ?? headerActions;

  return (
    <Card
      className={className}
      shadow="sm"
      classNames={{
        base: bordered ? "" : "border-none shadow-none bg-transparent",
      }}
    >
      {hasHeader && (
        <CardHeader className="flex flex-col items-start gap-1 px-4 pb-0 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-default-500">{subtitle}</p>}
          </div>
          {headerActions && <div className="mt-2 sm:mt-0">{headerActions}</div>}
        </CardHeader>
      )}
      <CardBody className="px-2 pb-4 pt-2">{children}</CardBody>
    </Card>
  );
}
