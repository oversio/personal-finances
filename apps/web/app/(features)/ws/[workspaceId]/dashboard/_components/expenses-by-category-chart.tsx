"use client";

import { Skeleton } from "@heroui/react";
import { ChartContainer, DonutChart, type DonutChartDataItem } from "@/_commons/components/charts";
import type { ExpensesBreakdown } from "../../reports/_api/expenses-breakdown.types";
import {
  formatCompactCurrency,
  getCurrentMonthCategorySummaries,
} from "../_utils/dashboard-calculations";

interface ExpensesByCategoryChartProps {
  breakdown: ExpensesBreakdown | undefined;
  isLoading: boolean;
}

export function ExpensesByCategoryChart({ breakdown, isLoading }: ExpensesByCategoryChartProps) {
  if (isLoading) {
    return (
      <ChartContainer title="Gastos por Categoría" subtitle="Este mes">
        <div className="flex h-[280px] items-center justify-center">
          <Skeleton className="size-48 rounded-full" />
        </div>
      </ChartContainer>
    );
  }

  const categories = breakdown ? getCurrentMonthCategorySummaries(breakdown, 6) : [];

  const totalExpenses = categories.reduce((sum, cat) => sum + cat.value, 0);

  const chartData: DonutChartDataItem[] = categories.map(cat => ({
    name: cat.name,
    value: cat.value,
    color: cat.color,
  }));

  if (chartData.length === 0) {
    return (
      <ChartContainer title="Gastos por Categoría" subtitle="Este mes">
        <div className="flex h-[280px] items-center justify-center text-default-400">
          Sin datos para este mes
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Gastos por Categoría" subtitle="Este mes">
      <DonutChart
        data={chartData}
        height={280}
        innerRadius="60%"
        centerLabel={{
          value: formatCompactCurrency(totalExpenses),
          subtitle: "Total",
        }}
        tooltipValueFormatter={value => formatCompactCurrency(Number(value))}
      />
    </ChartContainer>
  );
}
