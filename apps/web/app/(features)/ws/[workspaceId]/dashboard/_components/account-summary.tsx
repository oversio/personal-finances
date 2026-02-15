"use client";

import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useGetAccountList } from "../../accounts/_api/get-account-list/use-get-account-list";

interface AccountSummaryProps {
  workspaceId: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountSummary({ workspaceId }: AccountSummaryProps) {
  const { data: accounts, isLoading } = useGetAccountList({ workspaceId });

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  const totalBalance = accounts?.reduce((sum, account) => sum + account.currentBalance, 0) ?? 0;
  const currency = accounts?.[0]?.currency ?? "USD";

  return (
    <Card>
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <h3 className="text-lg font-semibold">Accounts</h3>
        <Link
          href={`/ws/${workspaceId}/accounts`}
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <div className="mb-4">
          <p className="text-sm text-default-500">Total Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance, currency)}</p>
        </div>
        <div className="space-y-3">
          {accounts?.slice(0, 4).map(account => (
            <div key={account.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
                <span className="text-sm">{account.name}</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(account.currentBalance, account.currency)}
              </span>
            </div>
          ))}
          {(accounts?.length ?? 0) === 0 && (
            <p className="text-center text-sm text-default-400">No accounts yet</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
