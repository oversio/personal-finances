import type { Transaction } from "../../transactions/_api/transaction.types";
import type { ExpensesBreakdown } from "../../reports/_api/expenses-breakdown.types";

/** Monthly summary for trend charts */
export interface MonthlySummary {
  month: string; // "Ene", "Feb", etc.
  monthNumber: number;
  income: number;
  expenses: number;
  net: number;
  [key: string]: string | number; // Index signature for chart compatibility
}

/** Category summary for donut/bar charts */
export interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

const MONTH_LABELS: readonly string[] = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

/**
 * Calculate monthly income/expense trends from transactions.
 * Returns last 6 months of data for sparklines/charts.
 */
export function calculateMonthlyTrends(
  transactions: Transaction[],
  monthsBack = 6,
): MonthlySummary[] {
  const now = new Date();
  const result: MonthlySummary[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    });

    const income = monthTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = monthTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    result.push({
      month: MONTH_LABELS[month] ?? "",
      monthNumber: month + 1,
      income,
      expenses,
      net: income - expenses,
    });
  }

  return result;
}

/**
 * Calculate sparkline data (just values) for KPI cards
 */
export function calculateSparklineData(
  transactions: Transaction[],
  type: "income" | "expense" | "net" | "balance",
  monthsBack = 6,
): number[] {
  const trends = calculateMonthlyTrends(transactions, monthsBack);

  switch (type) {
    case "income":
      return trends.map(t => t.income);
    case "expense":
      return trends.map(t => t.expenses);
    case "net":
      return trends.map(t => t.net);
    case "balance":
      // For balance, we'd need account history - use net as proxy
      return trends.map(t => t.net);
    default:
      return trends.map(t => t.net);
  }
}

/**
 * Calculate trend percentage (current month vs previous month)
 */
export function calculateTrendPercentage(currentValue: number, previousValue: number): number {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Transform expenses breakdown to category summaries for charts
 */
export function expensesToCategorySummaries(
  breakdown: ExpensesBreakdown,
  limit?: number,
): CategorySummary[] {
  const summaries = breakdown.categories
    .map(cat => ({
      name: cat.categoryName,
      value: cat.yearTotal,
      color: cat.categoryColor,
    }))
    .sort((a, b) => b.value - a.value);

  return limit ? summaries.slice(0, limit) : summaries;
}

/**
 * Get current month's expenses by category from breakdown
 */
export function getCurrentMonthCategorySummaries(
  breakdown: ExpensesBreakdown,
  limit?: number,
): CategorySummary[] {
  const currentMonth = new Date().getMonth() + 1;

  const summaries = breakdown.categories
    .map(cat => {
      const monthData = cat.months.find(m => m.month === currentMonth);
      return {
        name: cat.categoryName,
        value: monthData?.total ?? 0,
        color: cat.categoryColor,
      };
    })
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return limit ? summaries.slice(0, limit) : summaries;
}

/**
 * Format currency for Chilean locale
 */
export function formatCurrency(amount: number, currency = "CLP"): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format compact currency (1.2M, 450k)
 */
export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absAmount >= 1_000_000) {
    return `${sign}$${(absAmount / 1_000_000).toFixed(1)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}$${Math.round(absAmount / 1_000)}k`;
  }
  return `${sign}$${absAmount.toLocaleString("es-CL")}`;
}
