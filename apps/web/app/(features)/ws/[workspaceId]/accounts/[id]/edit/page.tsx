"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetAccount } from "../../_api/get-account/use-get-account";
import { useUpdateAccount } from "../../_api/update-account/use-update-account";
import { AccountForm } from "../../_components/account-form";
import type { CreateAccountFormData } from "../../_schemas/account.schema";

export default function EditAccountPage() {
  const params = useParams<{ workspaceId: string; id: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const accountId = params.id;

  const { data: account, isLoading, error: fetchError } = useGetAccount({ workspaceId, accountId });
  const { mutate: updateAccount, isPending, error: updateError } = useUpdateAccount();

  const handleSubmit = (data: CreateAccountFormData) => {
    updateAccount(
      {
        workspaceId,
        accountId,
        data: {
          name: data.name,
          type: data.type,
          color: data.color,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/accounts`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError || !account) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
        <p>Cuenta no encontrada o error al cargar.</p>
        <Button as={Link} href={`/ws/${workspaceId}/accounts`} className="mt-4" variant="flat">
          Volver a Cuentas
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href={`/ws/${workspaceId}/accounts`} variant="light" isIconOnly>
          <svg
            className="size-5"
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
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Cuenta</h1>
          <p className="text-default-500">{account.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalles de la Cuenta</h2>
        </CardHeader>
        <CardBody>
          <AccountForm
            account={account}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={updateError}
            submitLabel="Guardar Cambios"
          />
        </CardBody>
      </Card>
    </div>
  );
}
