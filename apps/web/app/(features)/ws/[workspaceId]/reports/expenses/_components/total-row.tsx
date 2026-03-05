"use client";

import type { MonthlyExpense } from "../../_api/expenses-breakdown.types";

interface TotalRowProps {
  monthlyTotals: MonthlyExpense[];
  grandTotal: number;
}

function getMonthTotal(months: MonthlyExpense[], monthNumber: number): number {
  return months.find(m => m.month === monthNumber)?.total ?? 0;
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function TotalRow({ monthlyTotals, grandTotal }: TotalRowProps) {
  return (
    <tr className="border-t-2 border-default-300 bg-default-100 font-bold">
      <td className="sticky left-0 z-10 bg-default-100 px-4 py-3">TOTAL</td>
      {/* Month totals */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
        const total = getMonthTotal(monthlyTotals, month);
        return (
          <td key={month} className="px-2 py-3 text-right">
            {total > 0 ? formatFullCurrency(total) : "-"}
          </td>
        );
      })}
      {/* Grand total */}
      <td className="px-4 py-3 text-right text-primary">{formatFullCurrency(grandTotal)}</td>
    </tr>
  );
}
