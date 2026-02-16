"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountList } from "./_components/account-list";

export default function AccountsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuentas</h1>
          <p className="text-default-500">Administra tus cuentas financieras</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/accounts/new`} color="primary">
          Nueva Cuenta
        </Button>
      </div>

      <AccountList workspaceId={workspaceId} />
    </div>
  );
}
