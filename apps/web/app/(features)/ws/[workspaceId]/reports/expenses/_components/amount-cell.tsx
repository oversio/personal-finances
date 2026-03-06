"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useState } from "react";
import { formatFullCurrency } from "../_utils/format-currency";
import { TransactionPopover } from "./transaction-popover";

interface AmountCellProps {
  amount: number;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  month: number;
  year: number;
  workspaceId: string;
  currency?: string;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return amount.toLocaleString("es-CL");
}

export function AmountCell({
  amount,
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  month,
  year,
  workspaceId,
  currency,
}: AmountCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (amount === 0) {
    return (
      <td className="px-2 py-2 text-center text-default-400">
        <span>-</span>
      </td>
    );
  }

  return (
    <td className="px-2 py-2 text-right">
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
        <PopoverTrigger>
          <button
            type="button"
            className="cursor-pointer rounded px-2 py-1 text-sm transition-colors hover:bg-default-100"
            title={formatFullCurrency(amount, currency)}
          >
            {formatCurrency(amount)}
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <TransactionPopover
            categoryId={categoryId}
            categoryName={categoryName}
            subcategoryId={subcategoryId}
            subcategoryName={subcategoryName}
            month={month}
            year={year}
            amount={amount}
            workspaceId={workspaceId}
            currency={currency}
          />
        </PopoverContent>
      </Popover>
    </td>
  );
}
