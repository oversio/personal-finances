"use client";

import type { SubcategoryBreakdown } from "../../_api/expenses-breakdown.types";
import { AmountCell } from "./amount-cell";

interface SubcategoryRowProps {
  subcategory: SubcategoryBreakdown;
  categoryId: string;
  categoryName: string;
  workspaceId: string;
  year: number;
}

function getMonthTotal(months: { month: number; total: number }[], monthNumber: number): number {
  return months.find(m => m.month === monthNumber)?.total ?? 0;
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function SubcategoryRow({
  subcategory,
  categoryId,
  categoryName,
  workspaceId,
  year,
}: SubcategoryRowProps) {
  return (
    <tr className="bg-content1 hover:bg-default-50">
      <td className="sticky left-0 z-10 bg-inherit px-4 py-2">
        <div className="flex items-center gap-2 pl-8">
          <span className="text-default-300">└</span>
          <span className="text-sm text-default-700">{subcategory.subcategoryName}</span>
        </div>
      </td>
      {/* Month cells */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
        <AmountCell
          key={month}
          amount={getMonthTotal(subcategory.months, month)}
          categoryId={categoryId}
          categoryName={categoryName}
          subcategoryId={subcategory.subcategoryId}
          subcategoryName={subcategory.subcategoryName}
          month={month}
          year={year}
          workspaceId={workspaceId}
        />
      ))}
      {/* Year total */}
      <td className="px-4 py-2 text-right text-sm">{formatFullCurrency(subcategory.yearTotal)}</td>
    </tr>
  );
}
