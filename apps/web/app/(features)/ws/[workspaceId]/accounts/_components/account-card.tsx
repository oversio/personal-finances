"use client";

import { Button, Card, CardBody, Tooltip } from "@heroui/react";
import { ArchiveIcon, ListIcon, PencilIcon } from "@repo/ui/icons";
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
  return new Intl.NumberFormat("es-CL", {
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

          <div className="flex gap-1">
            <Tooltip content="Ver transacciones">
              <Button
                as={Link}
                href={`/ws/${workspaceId}/transactions?accountId=${account.id}`}
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Ver transacciones"
              >
                <ListIcon className="size-5" />
              </Button>
            </Tooltip>

            <Tooltip content="Editar">
              <Button
                as={Link}
                href={`/ws/${workspaceId}/accounts/${account.id}/edit`}
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Editar cuenta"
              >
                <PencilIcon className="size-5" />
              </Button>
            </Tooltip>

            <Tooltip content="Archivar">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                aria-label="Archivar cuenta"
                onPress={() => onArchive(account.id)}
                isDisabled={isArchiving}
              >
                <ArchiveIcon className="size-5" />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-bold">
            {formatCurrency(account.currentBalance, account.currency)}
          </p>
          {account.initialBalance !== account.currentBalance && (
            <p className="text-small text-default-400">
              Inicial: {formatCurrency(account.initialBalance, account.currency)}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
