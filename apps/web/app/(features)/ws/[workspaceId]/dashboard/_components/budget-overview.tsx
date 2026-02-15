"use client";

import { Card, CardBody, CardHeader, Progress, Spinner } from "@heroui/react";
import Link from "next/link";
import { useGetBudgetList } from "../../budgets/_api/get-budget-list/use-get-budget-list";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";

interface BudgetOverviewProps {
  workspaceId: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetOverview({ workspaceId }: BudgetOverviewProps) {
  const { data: budgets, isLoading } = useGetBudgetList({ workspaceId });
  const { data: accounts } = useGetAccountList({ workspaceId });

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  const activeBudgets = budgets?.filter(b => !b.isArchived) ?? [];
  const currency = accounts?.[0]?.currency ?? "USD";

  return (
    <Card>
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <h3 className="text-lg font-semibold">Budgets</h3>
        <Link href={`/ws/${workspaceId}/budgets`} className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <div className="space-y-4">
          {activeBudgets.slice(0, 4).map(budget => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const color = isOverBudget ? "danger" : percentage > 80 ? "warning" : "success";

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{budget.category.name}</span>
                  <span className="text-sm text-default-500">
                    {formatCurrency(budget.spent, currency)} /{" "}
                    {formatCurrency(budget.amount, currency)}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  color={color}
                  size="sm"
                  aria-label={`${budget.category.name} budget progress`}
                />
              </div>
            );
          })}
          {activeBudgets.length === 0 && (
            <p className="text-center text-sm text-default-400">No budgets set</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
