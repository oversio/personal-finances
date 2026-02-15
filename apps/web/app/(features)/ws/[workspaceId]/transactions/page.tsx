"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { TransactionList } from "./_components/transaction-list";

export default function TransactionsPage() {
  const params = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const workspaceId = params.workspaceId;
  const accountId = searchParams.get("accountId") ?? undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-default-500">Track your income, expenses, and transfers</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/transactions/new`} color="primary">
          New Transaction
        </Button>
      </div>

      <TransactionList workspaceId={workspaceId} initialAccountId={accountId} />
    </div>
  );
}
