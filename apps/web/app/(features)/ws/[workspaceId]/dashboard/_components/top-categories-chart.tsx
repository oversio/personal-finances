"use client";

import { Skeleton } from "@heroui/react";
import { ChartContainer, HorizontalBarChart } from "@/_commons/components/charts";
import type { ExpensesBreakdown } from "../../reports/_api/expenses-breakdown.types";
import {
  formatCompactCurrency,
  getCurrentMonthCategorySummaries,
} from "../_utils/dashboard-calculations";

interface TopCategoriesChartProps {
  breakdown: ExpensesBreakdown | undefined;
  isLoading: boolean;
}

export function TopCategoriesChart({ breakdown, isLoading }: TopCategoriesChartProps) {
  if (isLoading) {
    return (
      <ChartContainer title="Top Gastos" subtitle="Este mes">
        <div className="space-y-3 py-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </ChartContainer>
    );
  }

  const categories = breakdown ? getCurrentMonthCategorySummaries(breakdown, 5) : [];

  if (categories.length === 0) {
    return (
      <ChartContainer title="Top Gastos" subtitle="Este mes">
        <div className="flex h-[200px] items-center justify-center text-default-400">
          Sin datos para este mes
        </div>
      </ChartContainer>
    );
  }

  const chartData = categories.map(cat => ({
    name: cat.name,
    amount: cat.value,
  }));

  return (
    <ChartContainer title="Top Gastos" subtitle="Este mes">
      <HorizontalBarChart
        data={chartData}
        categoryKey="name"
        valueKey="amount"
        height={200}
        colorByIndex
        barRadius={6}
        labelWidth={120}
        tooltipValueFormatter={value => formatCompactCurrency(Number(value))}
      />
    </ChartContainer>
  );
}
