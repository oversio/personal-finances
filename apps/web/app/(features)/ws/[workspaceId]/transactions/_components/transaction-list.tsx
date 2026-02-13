"use client";

import { Spinner } from "@heroui/react";
import { useState } from "react";
import { useGetAccounts } from "../../accounts/_api/use-get-accounts";
import { useGetCategories } from "../../categories/_api/use-get-categories";
import type { Transaction, TransactionFilters } from "../_api/transaction.types";
import { useDeleteTransaction } from "../_api/use-delete-transaction";
import { useGetTransactions } from "../_api/use-get-transactions";
import { TransactionCard } from "./transaction-card";
import { TransactionFiltersComponent } from "./transaction-filters";

interface TransactionListProps {
  workspaceId: string;
}

function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const dateKey = new Date(transaction.date).toISOString().split("T")[0]!;
    const existing = groups.get(dateKey) ?? [];
    existing.push(transaction);
    groups.set(dateKey, existing);
  }

  return groups;
}

function formatGroupDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateString === todayStr) {
    return "Today";
  }
  if (dateString === yesterdayStr) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TransactionList({ workspaceId }: TransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useGetTransactions({ workspaceId, filters });

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({ workspaceId });

  const deleteMutation = useDeleteTransaction();

  const handleArchive = async (transactionId: string) => {
    setArchivingId(transactionId);
    try {
      await deleteMutation.mutateAsync({ workspaceId, transactionId });
    } finally {
      setArchivingId(null);
    }
  };

  const isLoading = isLoadingTransactions || isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-danger">
        <p>Failed to load transactions</p>
        <p className="text-small">{transactionsError.message}</p>
      </div>
    );
  }

  const groupedTransactions = groupTransactionsByDate(transactions ?? []);
  const sortedDates = Array.from(groupedTransactions.keys()).sort().reverse();

  return (
    <div className="flex flex-col gap-6">
      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        accounts={accounts ?? []}
        categories={categories ?? []}
      />

      {transactions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-default-500">
          <p className="text-lg">No transactions yet</p>
          <p className="text-small">Create your first transaction to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedDates.map(dateKey => {
            const dateTransactions = groupedTransactions.get(dateKey) ?? [];
            return (
              <div key={dateKey} className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-default-500">{formatGroupDate(dateKey)}</h3>
                <div className="flex flex-col gap-3">
                  {dateTransactions.map(transaction => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      workspaceId={workspaceId}
                      accounts={accounts ?? []}
                      categories={categories ?? []}
                      onArchive={handleArchive}
                      isArchiving={archivingId === transaction.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
