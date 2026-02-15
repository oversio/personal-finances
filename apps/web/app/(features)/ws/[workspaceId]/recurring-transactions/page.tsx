"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RecurringTransactionList } from "./_components/recurring-transaction-list";

export default function RecurringTransactionsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Transactions</h1>
          <p className="text-default-500">Automate your regular income and expenses</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/recurring-transactions/new`} color="primary">
          New Recurring
        </Button>
      </div>

      <RecurringTransactionList workspaceId={workspaceId} />
    </div>
  );
}
