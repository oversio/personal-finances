"use client";

import { useParams } from "next/navigation";
import { useAuthStore, selectUser } from "@/_commons/stores/auth.store";
import { useGetAccountList } from "../accounts/_api/get-account-list/use-get-account-list";
import { useGetTransactionList } from "../transactions/_api/get-transaction-list/use-get-transaction-list";
import { StatCard } from "./_components/stat-card";
import { AccountSummary } from "./_components/account-summary";
import { BudgetOverview } from "./_components/budget-overview";
import { RecentTransactions } from "./_components/recent-transactions";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const user = useAuthStore(selectUser);

  const { data: accounts } = useGetAccountList({ workspaceId });
  const { data: transactions } = useGetTransactionList({ workspaceId, filters: {} });

  // Calculate stats
  const totalBalance = accounts?.reduce((sum, account) => sum + account.currentBalance, 0) ?? 0;
  const currency = accounts?.[0]?.currency ?? "USD";

  // Calculate this month's income and expenses
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTransactions =
    transactions?.filter(tx => new Date(tx.date) >= firstDayOfMonth) ?? [];

  const monthlyIncome = thisMonthTransactions
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyExpenses = thisMonthTransactions
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netIncome = monthlyIncome - monthlyExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-default-500">Welcome{user?.name ? `, ${user.name}` : ""}! 👋</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance, currency)}
          icon={
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="primary"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome, currency)}
          icon={
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="success"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses, currency)}
          icon={
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color="danger"
        />
        <StatCard
          title="Net Income"
          value={formatCurrency(netIncome, currency)}
          icon={
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          color={netIncome >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AccountSummary workspaceId={workspaceId} />
          <BudgetOverview workspaceId={workspaceId} />
        </div>
        <div>
          <RecentTransactions workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
