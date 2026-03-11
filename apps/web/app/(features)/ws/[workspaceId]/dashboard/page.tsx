"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/react";
import { KpiSparklineCard } from "@/_commons/components/charts";
import { selectUser, useAuthStore } from "@/_commons/stores/auth.store";
import { useGetExpensesBreakdown } from "../reports/_api/get-expenses-breakdown/use-get-expenses-breakdown";
import { useGetAccountList } from "../accounts/_api/get-account-list/use-get-account-list";
import { useGetTransactionList } from "../transactions/_api/get-transaction-list/use-get-transaction-list";
import { BudgetOverview } from "./_components/budget-overview";
import { ExpensesByCategoryChart } from "./_components/expenses-by-category-chart";
import { IncomeExpensesTrendChart } from "./_components/income-expenses-trend-chart";
import { RecentTransactions } from "./_components/recent-transactions";
import { TopCategoriesChart } from "./_components/top-categories-chart";
import {
  calculateMonthlyTrends,
  calculateSparklineData,
  calculateTrendPercentage,
  formatCurrency,
} from "./_utils/dashboard-calculations";

export default function DashboardPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const user = useAuthStore(selectUser);

  // Data fetching
  const { data: accounts } = useGetAccountList({ workspaceId });
  const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactionList({
    workspaceId,
    filters: {},
  });

  // Currency filter state
  const [selectedCurrency, setSelectedCurrency] = useState<string>();

  // Derive unique currencies from accounts, prioritizing CLP
  const availableCurrencies = useMemo(() => {
    if (!accounts?.length) return [];
    return [...new Set(accounts.map(a => a.currency))].sort((a, b) => {
      if (a === "CLP") return -1;
      if (b === "CLP") return 1;
      return a.localeCompare(b);
    });
  }, [accounts]);

  // Effective currency (with fallback)
  const effectiveCurrency = selectedCurrency ?? availableCurrencies[0] ?? "CLP";

  // Fetch expenses breakdown with currency filter
  const { data: expensesBreakdown, isLoading: isLoadingBreakdown } = useGetExpensesBreakdown({
    workspaceId,
    year: new Date().getFullYear(),
    currency: effectiveCurrency,
  });

  // Filter accounts and transactions by currency
  const filteredAccounts = accounts?.filter(a => a.currency === effectiveCurrency) ?? [];
  const filteredTransactions = transactions?.filter(tx => tx.currency === effectiveCurrency) ?? [];

  // Calculate stats from filtered data
  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.currentBalance, 0);

  // Calculate monthly trends from filtered transactions
  const monthlyTrends = calculateMonthlyTrends(filteredTransactions, 6);
  const currentMonth = monthlyTrends[monthlyTrends.length - 1];
  const previousMonth = monthlyTrends[monthlyTrends.length - 2];

  const monthlyIncome = currentMonth?.income ?? 0;
  const monthlyExpenses = currentMonth?.expenses ?? 0;
  const netIncome = currentMonth?.net ?? 0;

  // Calculate trend percentages
  const incomeTrend = previousMonth
    ? calculateTrendPercentage(monthlyIncome, previousMonth.income)
    : 0;
  const expensesTrend = previousMonth
    ? calculateTrendPercentage(monthlyExpenses, previousMonth.expenses)
    : 0;
  const netTrend = previousMonth ? calculateTrendPercentage(netIncome, previousMonth.net) : 0;

  // Sparkline data from filtered transactions
  const incomeSparkline = calculateSparklineData(filteredTransactions, "income", 6);
  const expensesSparkline = calculateSparklineData(filteredTransactions, "expense", 6);
  const netSparkline = calculateSparklineData(filteredTransactions, "net", 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inicio</h1>
          <p className="text-default-500">¡Bienvenido{user?.name ? `, ${user.name}` : ""}!</p>
        </div>
        {availableCurrencies.length > 1 && (
          <Select
            aria-label="Seleccionar moneda"
            selectedKeys={selectedCurrency ? [selectedCurrency] : [effectiveCurrency]}
            onSelectionChange={keys => {
              const currency = Array.from(keys)[0];
              if (currency) setSelectedCurrency(String(currency));
            }}
            className="w-28"
            size="sm"
            variant="flat"
            disallowEmptySelection
          >
            {availableCurrencies.map(currency => (
              <SelectItem key={currency}>{currency}</SelectItem>
            ))}
          </Select>
        )}
      </div>

      {/* KPI Cards with Sparklines */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiSparklineCard
          title="Saldo Total"
          subtitle="Todas las cuentas"
          value={formatCurrency(totalBalance, effectiveCurrency)}
          sparklineData={netSparkline}
          color="primary"
        />
        <KpiSparklineCard
          title="Ingresos del Mes"
          subtitle="vs mes anterior"
          value={formatCurrency(monthlyIncome, effectiveCurrency)}
          trendValue={incomeTrend}
          sparklineData={incomeSparkline}
        />
        <KpiSparklineCard
          title="Gastos del Mes"
          subtitle="vs mes anterior"
          value={formatCurrency(monthlyExpenses, effectiveCurrency)}
          trendValue={expensesTrend}
          upIsGood={false}
          sparklineData={expensesSparkline}
        />
        <KpiSparklineCard
          title="Balance Neto"
          subtitle="Ingresos - Gastos"
          value={formatCurrency(netIncome, effectiveCurrency)}
          trendValue={netTrend}
          sparklineData={netSparkline}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <IncomeExpensesTrendChart
          transactions={filteredTransactions}
          isLoading={isLoadingTransactions}
        />
        <ExpensesByCategoryChart breakdown={expensesBreakdown} isLoading={isLoadingBreakdown} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TopCategoriesChart breakdown={expensesBreakdown} isLoading={isLoadingBreakdown} />
        </div>
        <div className="lg:col-span-1">
          <BudgetOverview workspaceId={workspaceId} />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
