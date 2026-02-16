"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BudgetList } from "./_components/budget-list";

export default function BudgetsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-default-500">Controla tus gastos según tus límites de presupuesto</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/budgets/new`} color="primary">
          Nuevo Presupuesto
        </Button>
      </div>

      <BudgetList workspaceId={workspaceId} />
    </div>
  );
}
