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
import type { Transaction } from "../_api/transaction.types";
import { TRANSACTION_TYPE_COLORS, TRANSACTION_TYPE_LABELS } from "../_schemas/transaction.schema";

interface TransactionCardProps {
  transaction: Transaction;
  workspaceId: string;
  accounts: Account[];
  categories: Category[];
  onArchive: (transactionId: string) => void;
  isArchiving: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TransactionCard({
  transaction,
  workspaceId,
  accounts,
  categories,
  onArchive,
  isArchiving,
}: TransactionCardProps) {
  const account = accounts.find(a => a.id === transaction.accountId);
  const toAccount = transaction.toAccountId
    ? accounts.find(a => a.id === transaction.toAccountId)
    : undefined;
  const category = transaction.categoryId
    ? categories.find(c => c.id === transaction.categoryId)
    : undefined;
  const subcategory =
    transaction.subcategoryId && category
      ? category.subcategories.find(s => s.id === transaction.subcategoryId)
      : undefined;

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case "income":
        return "+";
      case "expense":
        return "-";
      default:
        return "";
    }
  };

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
                  base:
                    transaction.type === "income"
                      ? "bg-success/10"
                      : transaction.type === "expense"
                        ? "bg-danger/10"
                        : "bg-primary/10",
                  content: TRANSACTION_TYPE_COLORS[transaction.type],
                }}
              >
                {TRANSACTION_TYPE_LABELS[transaction.type]}
              </Chip>
              <span className="text-small text-default-400">
                {formatDate(new Date(transaction.date))}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-small">
              {account && (
                <span className="font-medium">
                  {transaction.type === "transfer" ? "Desde: " : ""}
                  {account.name}
                </span>
              )}
              {toAccount && (
                <>
                  <span className="text-default-500">→</span>
                  <span className="font-medium">Hacia: {toAccount.name}</span>
                </>
              )}
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

            {transaction.notes && (
              <p className="text-small text-default-400 line-clamp-2">{transaction.notes}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <p className={`text-lg font-bold ${TRANSACTION_TYPE_COLORS[transaction.type]}`}>
              {getAmountPrefix()}
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>

            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" aria-label="Acciones de transacción">
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
              <DropdownMenu aria-label="Acciones de transacción">
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/ws/${workspaceId}/transactions/${transaction.id}/edit`}
                >
                  Editar
                </DropdownItem>
                <DropdownItem
                  key="archive"
                  className="text-danger"
                  color="danger"
                  onPress={() => onArchive(transaction.id!)}
                  isDisabled={isArchiving}
                >
                  Archivar
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
