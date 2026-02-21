"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAccountList } from "../../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../../categories/_api/get-category-list/use-get-category-list";
import { useGetRecurringTransaction } from "../../_api/get-recurring-transaction/use-get-recurring-transaction";
import { useUpdateRecurringTransaction } from "../../_api/update-recurring-transaction/use-update-recurring-transaction";
import { RecurringTransactionForm } from "../../_components/recurring-transaction-form";
import type { CreateRecurringTransactionFormData } from "../../_schemas/recurring-transaction.schema";

export default function EditRecurringTransactionPage() {
  const params = useParams<{ workspaceId: string; id: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const recurringTransactionId = params.id;

  const { data: recurringTransaction, isLoading: isLoadingRecurring } = useGetRecurringTransaction({
    workspaceId,
    recurringTransactionId,
  });
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccountList({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryList({ workspaceId });
  const updateMutation = useUpdateRecurringTransaction();

  const handleSubmit = (data: CreateRecurringTransactionFormData) => {
    updateMutation.mutate(
      {
        workspaceId,
        recurringTransactionId,
        data: {
          type: data.type,
          accountId: data.accountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          amount: data.amount,
          notes: data.notes,
          frequency: data.frequency,
          interval: data.interval,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
          monthOfYear: data.monthOfYear,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/recurring-transactions`);
        },
      },
    );
  };

  const isLoading = isLoadingRecurring || isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!recurringTransaction) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-danger">Recurring transaction not found</p>
        <Button
          as={Link}
          href={`/ws/${workspaceId}/recurring-transactions`}
          variant="light"
          className="mt-4"
        >
          Back to Recurring Transactions
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Button
          as={Link}
          href={`/ws/${workspaceId}/recurring-transactions`}
          variant="light"
          size="sm"
          startContent={
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Back to Recurring Transactions
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <h1 className="text-xl font-bold">Edit Recurring Transaction</h1>
          <p className="text-small text-default-500">Update your recurring transaction settings</p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <RecurringTransactionForm
            workspaceId={workspaceId}
            recurringTransaction={recurringTransaction}
            accounts={accounts ?? []}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
            error={updateMutation.error}
            submitLabel="Update Recurring Transaction"
          />
        </CardBody>
      </Card>
    </div>
  );
}
