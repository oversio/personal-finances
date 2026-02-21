"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../categories/_api/get-category-list/use-get-category-list";
import { useCreateTransaction } from "../_api/create-transaction/use-create-transaction";
import { TransactionForm } from "../_components/transaction-form";
import type { CreateTransactionFormData } from "../_schemas/transaction.schema";

export default function NewTransactionPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccountList({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryList({ workspaceId });
  const createMutation = useCreateTransaction();

  const handleSubmit = (data: CreateTransactionFormData) => {
    createMutation.mutate(
      {
        workspaceId,
        data: {
          type: data.type,
          accountId: data.accountId,
          toAccountId: data.toAccountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          amount: data.amount,
          currency: data.currency,
          notes: data.notes,
          date: data.date,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/transactions`);
        },
      },
    );
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
          href={`/ws/${workspaceId}/transactions`}
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
          Volver a Transacciones
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6">
          <h1 className="text-xl font-bold">Nueva Transacción</h1>
          <p className="text-small text-default-500">
            Registra un nuevo ingreso, gasto o transferencia
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <TransactionForm
            workspaceId={workspaceId}
            accounts={accounts ?? []}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            error={createMutation.error}
            submitLabel="Crear Transacción"
          />
        </CardBody>
      </Card>
    </div>
  );
}
