"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetBudget } from "../../_api/get-budget/use-get-budget";
import { useUpdateBudget } from "../../_api/update-budget/use-update-budget";
import { BudgetForm } from "../../_components/budget-form";
import type { CreateBudgetFormData } from "../../_schemas/budget.schema";

export default function EditBudgetPage() {
  const params = useParams<{ workspaceId: string; id: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const budgetId = params.id;

  const { data: budget, isLoading, error: fetchError } = useGetBudget({ workspaceId, budgetId });
  const { mutate: updateBudget, isPending, error } = useUpdateBudget();

  const handleSubmit = (data: CreateBudgetFormData) => {
    updateBudget(
      {
        workspaceId,
        budgetId,
        data: {
          name: data.name,
          amount: data.amount,
          period: data.period,
          alertThreshold: data.alertThreshold,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/budgets`);
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

  if (fetchError || !budget) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
          <p>Error al cargar el presupuesto. Puede haber sido eliminado o no tienes acceso.</p>
          <Button
            as={Link}
            href={`/ws/${workspaceId}/budgets`}
            color="danger"
            variant="flat"
            className="mt-4"
          >
            Volver a Presupuestos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href={`/ws/${workspaceId}/budgets`} variant="light" isIconOnly>
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
          <h1 className="text-2xl font-bold">Editar Presupuesto</h1>
          <p className="text-default-500">Actualiza la configuración del presupuesto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalles del Presupuesto</h2>
        </CardHeader>
        <CardBody>
          <BudgetForm
            budget={budget}
            workspaceId={workspaceId}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
            submitLabel="Guardar Cambios"
          />
        </CardBody>
      </Card>
    </div>
  );
}
