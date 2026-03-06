"use client";

import type { MonthlyExpense } from "../../_api/expenses-breakdown.types";
import { formatFullCurrency } from "../_utils/format-currency";

interface TotalRowProps {
  monthlyTotals: MonthlyExpense[];
  grandTotal: number;
  currency?: string;
}

function getMonthTotal(months: MonthlyExpense[], monthNumber: number): number {
  return months.find(m => m.month === monthNumber)?.total ?? 0;
}

export function TotalRow({ monthlyTotals, grandTotal, currency }: TotalRowProps) {
  return (
    <tr className="border-t-2 border-default-300 bg-default-100 font-bold">
      <td className="sticky left-0 z-10 bg-default-100 px-4 py-3">TOTAL</td>
      {/* Month totals */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
        const total = getMonthTotal(monthlyTotals, month);
        return (
          <td key={month} className="px-2 py-3 text-right">
            {total > 0 ? formatFullCurrency(total, currency) : "-"}
          </td>
        );
      })}
      {/* Grand total */}
      <td className="px-4 py-3 text-right text-primary">
        {formatFullCurrency(grandTotal, currency)}
      </td>
    </tr>
  );
}
