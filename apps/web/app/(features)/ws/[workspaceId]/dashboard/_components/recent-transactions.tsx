"use client";

import { Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import Link from "next/link";
import { useGetTransactionList } from "../../transactions/_api/get-transaction-list/use-get-transaction-list";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../categories/_api/get-category-list/use-get-category-list";

interface RecentTransactionsProps {
  workspaceId: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  const today = new Date();
  const transactionDate = new Date(date);
  const diffTime = Math.abs(today.getTime() - transactionDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(transactionDate);
}

export function RecentTransactions({ workspaceId }: RecentTransactionsProps) {
  const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactionList({
    workspaceId,
    filters: {},
  });
  const { data: accounts } = useGetAccountList({ workspaceId });
  const { data: categories } = useGetCategoryList({ workspaceId });

  if (isLoadingTransactions) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  const recentTransactions = transactions?.slice(0, 5) ?? [];

  const getAccountName = (accountId: string) => {
    return accounts?.find(a => a.id === accountId)?.name ?? "Unknown";
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return null;
    return categories?.find(c => c.id === categoryId)?.name ?? "Unknown";
  };

  const typeColors = {
    income: "success",
    expense: "danger",
    transfer: "primary",
  } as const;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Link
          href={`/ws/${workspaceId}/transactions`}
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <div className="space-y-3">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Chip size="sm" color={typeColors[transaction.type]} variant="flat">
                    {transaction.type}
                  </Chip>
                  <span className="text-sm font-medium">{getAccountName(transaction.accountId)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-default-400">
                  {getCategoryName(transaction.categoryId) && (
                    <span>{getCategoryName(transaction.categoryId)}</span>
                  )}
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${transaction.type === "income" ? "text-success" : transaction.type === "expense" ? "text-danger" : ""}`}
              >
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="text-center text-sm text-default-400">No transactions yet</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
