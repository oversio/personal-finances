"use client";

import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { useGetAccounts } from "../../accounts/_api/use-get-accounts";
import { useGetCategories } from "../../categories/_api/use-get-categories";
import { useDeleteRecurringTransaction } from "../_api/use-delete-recurring-transaction";
import { useGetRecurringTransactions } from "../_api/use-get-recurring-transactions";
import { usePauseRecurringTransaction } from "../_api/use-pause-recurring-transaction";
import { useProcessRecurringTransactions } from "../_api/use-process-recurring-transactions";
import { useResumeRecurringTransaction } from "../_api/use-resume-recurring-transaction";
import { RecurringTransactionCard } from "./recurring-transaction-card";

interface RecurringTransactionListProps {
  workspaceId: string;
}

export function RecurringTransactionList({ workspaceId }: RecurringTransactionListProps) {
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const {
    data: recurringTransactions,
    isLoading: isLoadingRecurring,
    error: recurringError,
  } = useGetRecurringTransactions({ workspaceId });

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({ workspaceId });

  const deleteMutation = useDeleteRecurringTransaction();
  const pauseMutation = usePauseRecurringTransaction();
  const resumeMutation = useResumeRecurringTransaction();
  const processMutation = useProcessRecurringTransactions();

  const handleArchive = async (id: string) => {
    setArchivingId(id);
    try {
      await deleteMutation.mutateAsync({ workspaceId, recurringTransactionId: id });
    } finally {
      setArchivingId(null);
    }
  };

  const handlePause = async (id: string) => {
    setPausingId(id);
    try {
      await pauseMutation.mutateAsync({ workspaceId, recurringTransactionId: id });
    } finally {
      setPausingId(null);
    }
  };

  const handleResume = async (id: string) => {
    setResumingId(id);
    try {
      await resumeMutation.mutateAsync({ workspaceId, recurringTransactionId: id });
    } finally {
      setResumingId(null);
    }
  };

  const handleProcess = async () => {
    await processMutation.mutateAsync({ workspaceId });
  };

  const isLoading = isLoadingRecurring || isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (recurringError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-danger">
        <p>Failed to load recurring transactions</p>
        <p className="text-small">{recurringError.message}</p>
      </div>
    );
  }

  // Separate active and paused transactions
  const activeTransactions = (recurringTransactions ?? []).filter(rt => rt.isActive);
  const pausedTransactions = (recurringTransactions ?? []).filter(rt => !rt.isActive);

  // Count due transactions
  const dueCount = activeTransactions.filter(rt => new Date(rt.nextRunDate) <= new Date()).length;

  return (
    <div className="flex flex-col gap-6">
      {dueCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-warning/10 p-4">
          <div>
            <p className="font-medium text-warning">
              {dueCount} recurring transaction{dueCount > 1 ? "s" : ""} due
            </p>
            <p className="text-small text-default-500">
              Process to create the corresponding transactions
            </p>
          </div>
          <Button color="warning" onPress={handleProcess} isLoading={processMutation.isPending}>
            Process Now
          </Button>
        </div>
      )}

      {processMutation.data && (
        <div className="rounded-lg bg-success/10 p-4">
          <p className="font-medium text-success">
            Processed {processMutation.data.processed} recurring transaction
            {processMutation.data.processed !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {recurringTransactions?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-default-500">
          <p className="text-lg">No recurring transactions yet</p>
          <p className="text-small">
            Create your first recurring transaction to automate your finances
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {activeTransactions.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-default-500">
                Active ({activeTransactions.length})
              </h3>
              <div className="flex flex-col gap-3">
                {activeTransactions.map(rt => (
                  <RecurringTransactionCard
                    key={rt.id}
                    recurringTransaction={rt}
                    workspaceId={workspaceId}
                    accounts={accounts ?? []}
                    categories={categories ?? []}
                    onArchive={handleArchive}
                    onPause={handlePause}
                    onResume={handleResume}
                    isArchiving={archivingId === rt.id}
                    isPausing={pausingId === rt.id}
                    isResuming={resumingId === rt.id}
                  />
                ))}
              </div>
            </div>
          )}

          {pausedTransactions.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-default-500">
                Paused ({pausedTransactions.length})
              </h3>
              <div className="flex flex-col gap-3">
                {pausedTransactions.map(rt => (
                  <RecurringTransactionCard
                    key={rt.id}
                    recurringTransaction={rt}
                    workspaceId={workspaceId}
                    accounts={accounts ?? []}
                    categories={categories ?? []}
                    onArchive={handleArchive}
                    onPause={handlePause}
                    onResume={handleResume}
                    isArchiving={archivingId === rt.id}
                    isPausing={pausingId === rt.id}
                    isResuming={resumingId === rt.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
