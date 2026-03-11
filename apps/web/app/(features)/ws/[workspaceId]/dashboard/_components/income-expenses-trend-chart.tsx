"use client";

import { Skeleton } from "@heroui/react";
import { AreaChart, ChartContainer } from "@/_commons/components/charts";
import type { Transaction } from "../../transactions/_api/transaction.types";
import { calculateMonthlyTrends, formatCompactCurrency } from "../_utils/dashboard-calculations";

interface IncomeExpensesTrendChartProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
}

export function IncomeExpensesTrendChart({
  transactions,
  isLoading,
}: IncomeExpensesTrendChartProps) {
  if (isLoading) {
    return (
      <ChartContainer title="Ingresos vs Gastos" subtitle="Últimos 6 meses">
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </ChartContainer>
    );
  }

  const monthlyData = transactions ? calculateMonthlyTrends(transactions, 6) : [];

  if (monthlyData.length === 0) {
    return (
      <ChartContainer title="Ingresos vs Gastos" subtitle="Últimos 6 meses">
        <div className="flex h-[250px] items-center justify-center text-default-400">
          Sin datos disponibles
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Ingresos vs Gastos" subtitle="Últimos 6 meses">
      <AreaChart
        data={monthlyData}
        xKey="month"
        series={[
          { key: "income", label: "Ingresos", color: "success" },
          { key: "expenses", label: "Gastos", color: "danger" },
        ]}
        height={250}
        showGrid
        showLegend
        tooltipValueFormatter={value => formatCompactCurrency(Number(value))}
      />
    </ChartContainer>
  );
}
