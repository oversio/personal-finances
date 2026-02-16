"use client";

import { Button, Spinner } from "@heroui/react";
import Link from "next/link";
import { useDeleteBudget } from "../_api/delete-budget/use-delete-budget";
import { useGetBudgetList } from "../_api/get-budget-list/use-get-budget-list";
import { BudgetCard } from "./budget-card";

interface BudgetListProps {
  workspaceId: string;
}

export function BudgetList({ workspaceId }: BudgetListProps) {
  const { data: budgets, isLoading, error } = useGetBudgetList({ workspaceId });
  const { mutate: deleteBudget, isPending: isDeleting } = useDeleteBudget();

  const handleArchive = (budgetId: string) => {
    if (confirm("¿Estás seguro de que deseas archivar este presupuesto?")) {
      deleteBudget({ workspaceId, budgetId });
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
        <p>Error al cargar los presupuestos. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
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
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Aún no hay presupuestos</h3>
          <p className="text-small text-default-500">
            Crea tu primer presupuesto para controlar tus gastos
          </p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/budgets/new`} color="primary">
          Crear Presupuesto
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map(budget => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          workspaceId={workspaceId}
          onArchive={handleArchive}
          isArchiving={isDeleting}
        />
      ))}
    </div>
  );
}
