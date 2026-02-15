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
import type { Account } from "../../accounts/_api/account.types";
import type { Category } from "../../categories/_api/category.types";
import type { RecurringTransaction } from "../_api/recurring-transaction.types";
import {
  DAY_OF_WEEK_LABELS,
  FREQUENCY_LABELS,
  MONTH_LABELS,
  RECURRING_TRANSACTION_TYPE_COLORS,
  RECURRING_TRANSACTION_TYPE_LABELS,
} from "../_schemas/recurring-transaction.schema";

interface RecurringTransactionCardProps {
  recurringTransaction: RecurringTransaction;
  workspaceId: string;
  accounts: Account[];
  categories: Category[];
  onArchive: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  isArchiving: boolean;
  isPausing: boolean;
  isResuming: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatSchedule(rt: RecurringTransaction): string {
  const { schedule } = rt;
  const interval = schedule.interval === 1 ? "" : `${schedule.interval} `;

  switch (schedule.frequency) {
    case "daily":
      return interval ? `Every ${interval}days` : "Daily";
    case "weekly": {
      const day = DAY_OF_WEEK_LABELS[schedule.dayOfWeek ?? 0];
      return interval ? `Every ${interval}weeks on ${day}` : `Weekly on ${day}`;
    }
    case "monthly": {
      const dayOfMonth = schedule.dayOfMonth ?? 1;
      const suffix = getOrdinalSuffix(dayOfMonth);
      return interval
        ? `Every ${interval}months on the ${dayOfMonth}${suffix}`
        : `Monthly on the ${dayOfMonth}${suffix}`;
    }
    case "yearly": {
      const dayOfMonth = schedule.dayOfMonth ?? 1;
      const suffix = getOrdinalSuffix(dayOfMonth);
      const month = MONTH_LABELS[schedule.monthOfYear ?? 1];
      return interval
        ? `Every ${interval}years on ${month} ${dayOfMonth}${suffix}`
        : `Yearly on ${month} ${dayOfMonth}${suffix}`;
    }
    default:
      return FREQUENCY_LABELS[schedule.frequency];
  }
}

function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function RecurringTransactionCard({
  recurringTransaction,
  workspaceId,
  accounts,
  categories,
  onArchive,
  onPause,
  onResume,
  isArchiving,
  isPausing,
  isResuming,
}: RecurringTransactionCardProps) {
  const account = accounts.find(a => a.id === recurringTransaction.accountId);
  const category = categories.find(c => c.id === recurringTransaction.categoryId);
  const subcategory =
    recurringTransaction.subcategoryId && category
      ? category.subcategories.find(s => s.id === recurringTransaction.subcategoryId)
      : undefined;

  const getAmountPrefix = () => {
    return recurringTransaction.type === "income" ? "+" : "-";
  };

  const isProcessing = isArchiving || isPausing || isResuming;

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <Chip
                size="sm"
                variant="flat"
                classNames={{
                  base: recurringTransaction.type === "income" ? "bg-success/10" : "bg-danger/10",
                  content: RECURRING_TRANSACTION_TYPE_COLORS[recurringTransaction.type],
                }}
              >
                {RECURRING_TRANSACTION_TYPE_LABELS[recurringTransaction.type]}
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                color={recurringTransaction.isActive ? "success" : "warning"}
              >
                {recurringTransaction.isActive ? "Active" : "Paused"}
              </Chip>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-small">
              {account && <span className="font-medium">{account.name}</span>}
              {category && (
                <>
                  <span className="text-default-300">•</span>
                  <span className="text-default-500">
                    {category.name}
                    {subcategory ? ` / ${subcategory.name}` : ""}
                  </span>
                </>
              )}
            </div>

            <p className="text-small text-default-500">{formatSchedule(recurringTransaction)}</p>

            <div className="flex gap-4 text-small text-default-400">
              <span>Next: {formatDate(recurringTransaction.nextRunDate)}</span>
              {recurringTransaction.lastRunDate && (
                <span>Last: {formatDate(recurringTransaction.lastRunDate)}</span>
              )}
            </div>

            {recurringTransaction.notes && (
              <p className="text-small text-default-400 line-clamp-2">
                {recurringTransaction.notes}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <p
              className={`text-lg font-bold ${RECURRING_TRANSACTION_TYPE_COLORS[recurringTransaction.type]}`}
            >
              {getAmountPrefix()}
              {formatCurrency(recurringTransaction.amount, recurringTransaction.currency)}
            </p>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Recurring transaction actions"
                  isDisabled={isProcessing}
                >
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
              <DropdownMenu aria-label="Recurring transaction actions">
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/ws/${workspaceId}/recurring-transactions/${recurringTransaction.id}/edit`}
                >
                  Edit
                </DropdownItem>
                {recurringTransaction.isActive ? (
                  <DropdownItem
                    key="pause"
                    onPress={() => onPause(recurringTransaction.id)}
                    isDisabled={isPausing}
                  >
                    Pause
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    key="resume"
                    onPress={() => onResume(recurringTransaction.id)}
                    isDisabled={isResuming}
                  >
                    Resume
                  </DropdownItem>
                )}
                <DropdownItem
                  key="archive"
                  className="text-danger"
                  color="danger"
                  onPress={() => onArchive(recurringTransaction.id)}
                  isDisabled={isArchiving}
                >
                  Archive
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
