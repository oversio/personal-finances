"use client";

import { useParams } from "next/navigation";
import { ExpensesBreakdownTable } from "./_components/expenses-breakdown-table";

export default function ExpensesReportPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Gastos por Categoría</h1>
        <p className="text-default-500">Resumen de gastos agrupados por categoría y mes</p>
      </div>

      <ExpensesBreakdownTable workspaceId={workspaceId} />
    </div>
  );
}
