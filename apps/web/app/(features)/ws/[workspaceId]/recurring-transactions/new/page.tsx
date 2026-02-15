"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAccounts } from "../../accounts/_api/use-get-accounts";
import { useGetCategories } from "../../categories/_api/use-get-categories";
import { useCreateRecurringTransaction } from "../_api/use-create-recurring-transaction";
import { RecurringTransactionForm } from "../_components/recurring-transaction-form";
import type { CreateRecurringTransactionFormData } from "../_schemas/recurring-transaction.schema";

export default function NewRecurringTransactionPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({ workspaceId });
  const createMutation = useCreateRecurringTransaction();

  const handleSubmit = async (data: CreateRecurringTransactionFormData) => {
    await createMutation.mutateAsync({
      workspaceId,
      data: {
        type: data.type,
        accountId: data.accountId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        amount: data.amount,
        currency: data.currency,
        notes: data.notes,
        frequency: data.frequency,
        interval: data.interval,
        dayOfWeek: data.dayOfWeek,
        dayOfMonth: data.dayOfMonth,
        monthOfYear: data.monthOfYear,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    router.push(`/ws/${workspaceId}/recurring-transactions`);
  };

  const isLoading = isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
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
          <h1 className="text-xl font-bold">New Recurring Transaction</h1>
          <p className="text-small text-default-500">Set up automatic income or expense tracking</p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <RecurringTransactionForm
            accounts={accounts ?? []}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            error={createMutation.error}
            submitLabel="Create Recurring Transaction"
          />
        </CardBody>
      </Card>
    </div>
  );
}
