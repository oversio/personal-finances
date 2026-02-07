"use client";

import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import type { Account } from "../_api/account.types";
import { ACCOUNT_TYPE_LABELS } from "../_schemas/account.schema";

interface AccountCardProps {
  account: Account;
  workspaceId: string;
  onArchive: (accountId: string) => void;
  isArchiving: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountCard({ account, workspaceId, onArchive, isArchiving }: AccountCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: account.color }} />
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{account.name}</h3>
            <p className="text-small text-default-500">
              {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
            </p>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light" aria-label="Account actions">
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
            <DropdownMenu aria-label="Account actions">
              <DropdownItem
                key="edit"
                as={Link}
                href={`/ws/${workspaceId}/accounts/${account.id}/edit`}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                key="archive"
                className="text-danger"
                color="danger"
                onPress={() => onArchive(account.id)}
                isDisabled={isArchiving}
              >
                Archive
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-bold">
            {formatCurrency(account.currentBalance, account.currency)}
          </p>
          {account.initialBalance !== account.currentBalance && (
            <p className="text-small text-default-400">
              Initial: {formatCurrency(account.initialBalance, account.currency)}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
