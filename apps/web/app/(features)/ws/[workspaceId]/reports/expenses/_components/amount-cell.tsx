"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useState } from "react";
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

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
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
            title={formatFullCurrency(amount)}
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
          />
        </PopoverContent>
      </Popover>
    </td>
  );
}
