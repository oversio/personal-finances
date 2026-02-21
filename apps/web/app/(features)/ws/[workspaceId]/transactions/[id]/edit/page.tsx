"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAccountList } from "../../../accounts/_api/get-account-list/use-get-account-list";
import { useGetCategoryList } from "../../../categories/_api/get-category-list/use-get-category-list";
import { useGetTransaction } from "../../_api/get-transaction/use-get-transaction";
import { useUpdateTransaction } from "../../_api/update-transaction/use-update-transaction";
import { TransactionForm } from "../../_components/transaction-form";
import type { CreateTransactionFormData } from "../../_schemas/transaction.schema";

export default function EditTransactionPage() {
  const params = useParams<{ workspaceId: string; id: string }>();
  const router = useRouter();
  const { workspaceId, id: transactionId } = params;

  const {
    data: transaction,
    isLoading: isLoadingTransaction,
    error: transactionError,
  } = useGetTransaction({ workspaceId, transactionId });
  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccountList({ workspaceId });
  const { data: categories, isLoading: isLoadingCategories } = useGetCategoryList({ workspaceId });
  const updateMutation = useUpdateTransaction();

  const handleSubmit = (data: CreateTransactionFormData) => {
    updateMutation.mutate(
      {
        workspaceId,
        transactionId,
        data: {
          type: data.type,
          accountId: data.accountId,
          toAccountId: data.toAccountId,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          amount: data.amount,
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

  const isLoading = isLoadingTransaction || isLoadingAccounts || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (transactionError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-danger">Error al cargar la transacción</p>
        <p className="text-small text-default-500">{transactionError.message}</p>
        <Button as={Link} href={`/ws/${workspaceId}/transactions`} variant="light" className="mt-4">
          Volver a Transacciones
        </Button>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-default-500">Transacción no encontrada</p>
        <Button as={Link} href={`/ws/${workspaceId}/transactions`} variant="light" className="mt-4">
          Volver a Transacciones
        </Button>
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
          <h1 className="text-xl font-bold">Editar Transacción</h1>
          <p className="text-small text-default-500">Actualiza los detalles de la transacción</p>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <TransactionForm
            transaction={transaction}
            accounts={accounts ?? []}
            categories={categories ?? []}
            onSubmit={handleSubmit}
            isPending={updateMutation.isPending}
            error={updateMutation.error}
            submitLabel="Guardar Cambios"
          />
        </CardBody>
      </Card>
    </div>
  );
}
