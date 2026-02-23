"use client";

import { Spinner } from "@heroui/react";
import { useState } from "react";
import { dateToLocalDateString } from "@/_commons/utils/date";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../categories/_api/get-category-list/use-get-category-list";
import type { Transaction, TransactionFilters } from "../_api/transaction.types";
import { useDeleteTransaction } from "../_api/delete-transaction/use-delete-transaction";
import { useGetTransactionList } from "../_api/get-transaction-list/use-get-transaction-list";
import { TransactionCard } from "./transaction-card";
import { TransactionFiltersComponent } from "./transaction-filters";

interface TransactionListProps {
  workspaceId: string;
  initialAccountId?: string;
}

function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const dateKey = dateToLocalDateString(new Date(transaction.date));
    const existing = groups.get(dateKey) ?? [];
    existing.push(transaction);
    groups.set(dateKey, existing);
  }

  return groups;
}

function formatGroupDate(dateString: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = dateToLocalDateString(today);
  const yesterdayStr = dateToLocalDateString(yesterday);

  if (dateString === todayStr) {
    return "Hoy";
  }
  if (dateString === yesterdayStr) {
    return "Ayer";
  }

  // Parse the date string (YYYY-MM-DD) and create date at noon to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year!, month! - 1, day!, 12, 0, 0);

  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TransactionList({ workspaceId, initialAccountId }: TransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    accountId: initialAccountId,
  });
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useGetTransactionList({ workspaceId, filters });

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccountList({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryList({ workspaceId });

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
        <p>Error al cargar las transacciones</p>
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
          <p className="text-lg">Aún no hay transacciones</p>
          <p className="text-small">Crea tu primera transacción para comenzar</p>
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
