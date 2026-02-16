"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import type { Budget } from "../_api/budget.types";
import { BUDGET_PERIOD_LABELS } from "../_schemas/budget.schema";
import { BudgetProgressBar } from "./budget-progress-bar";

interface BudgetCardProps {
  budget: Budget;
  workspaceId: string;
  onArchive: (budgetId: string) => void;
  isArchiving: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPeriodRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = new Intl.DateTimeFormat("es-CL", options).format(start);
  const endStr = new Intl.DateTimeFormat("es-CL", options).format(end);
  return `${startStr} - ${endStr}`;
}

export function BudgetCard({ budget, workspaceId, onArchive, isArchiving }: BudgetCardProps) {
  const statusColor = budget.isExceeded ? "danger" : budget.isWarning ? "warning" : "success";

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{budget.name}</h3>
            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat" color="default">
                {budget.category.name}
              </Chip>
              {budget.subcategory && (
                <Chip size="sm" variant="flat" color="secondary">
                  {budget.subcategory.name}
                </Chip>
              )}
            </div>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light" aria-label="Acciones del presupuesto">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones del presupuesto">
              <DropdownItem
                key="edit"
                as={Link}
                href={`/ws/${workspaceId}/budgets/${budget.id}/edit`}
              >
                Editar
              </DropdownItem>
              <DropdownItem
                key="archive"
                className="text-danger"
                color="danger"
                onPress={() => onArchive(budget.id)}
                isDisabled={isArchiving}
              >
                Archivar
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{formatCurrency(budget.spent)}</span>
            <span className="text-default-500">de {formatCurrency(budget.amount)}</span>
          </div>

          <BudgetProgressBar
            percentage={budget.percentage}
            alertThreshold={budget.alertThreshold}
          />

          <div className="flex items-center justify-between text-small text-default-500">
            <span>
              {BUDGET_PERIOD_LABELS[budget.period]} •{" "}
              {formatPeriodRange(budget.periodStart, budget.periodEnd)}
            </span>
            <Chip size="sm" color={statusColor} variant="flat">
              {budget.isExceeded
                ? "Excedido"
                : budget.isWarning
                  ? "Alerta"
                  : `${formatCurrency(budget.remaining)} restante`}
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
