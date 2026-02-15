"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCreateBudget } from "../_api/create-budget/use-create-budget";
import { BudgetForm } from "../_components/budget-form";
import type { CreateBudgetFormData } from "../_schemas/budget.schema";

export default function NewBudgetPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { mutate: createBudget, isPending, error } = useCreateBudget();

  const handleSubmit = (data: CreateBudgetFormData) => {
    createBudget(
      {
        workspaceId,
        data: {
          ...data,
          startDate: data.startDate.toISOString(),
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/budgets`);
        },
      },
    );
  };

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
          <h1 className="text-2xl font-bold">New Budget</h1>
          <p className="text-default-500">Set a spending limit for a category</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Budget Details</h2>
        </CardHeader>
        <CardBody>
          <BudgetForm
            workspaceId={workspaceId}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={error}
          />
        </CardBody>
      </Card>
    </div>
  );
}
