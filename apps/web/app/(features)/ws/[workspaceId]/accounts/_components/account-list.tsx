"use client";

import { Button, Spinner } from "@heroui/react";
import Link from "next/link";
import { useDeleteAccount } from "../_api/delete-account/use-delete-account";
import { useGetAccountList } from "../_api/get-account-list/use-get-account-list";
import { AccountCard } from "./account-card";

interface AccountListProps {
  workspaceId: string;
}

export function AccountList({ workspaceId }: AccountListProps) {
  const { data: accounts, isLoading, error } = useGetAccountList({ workspaceId });
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleArchive = (accountId: string) => {
    if (confirm("¿Estás seguro de que deseas archivar esta cuenta?")) {
      deleteAccount({ workspaceId, accountId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
        <p>Error al cargar las cuentas. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-default-300 py-12">
        <svg
          className="size-12 text-default-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Aún no hay cuentas</h3>
          <p className="text-small text-default-500">Crea tu primera cuenta para comenzar</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/accounts/new`} color="primary">
          Crear Cuenta
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map(account => (
        <AccountCard
          key={account.id}
          account={account}
          workspaceId={workspaceId}
          onArchive={handleArchive}
          isArchiving={isDeleting}
        />
      ))}
    </div>
  );
}
