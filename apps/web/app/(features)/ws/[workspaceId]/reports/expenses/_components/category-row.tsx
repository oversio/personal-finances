"use client";

import { ChevronDownIcon } from "@repo/ui/icons";
import type { CategoryBreakdown } from "../../_api/expenses-breakdown.types";
import { formatFullCurrency } from "../_utils/format-currency";
import { AmountCell } from "./amount-cell";
import { SubcategoryRow } from "./subcategory-row";

interface CategoryRowProps {
  category: CategoryBreakdown;
  isExpanded: boolean;
  onToggle: () => void;
  workspaceId: string;
  year: number;
  currency?: string;
}

function getMonthTotal(months: { month: number; total: number }[], monthNumber: number): number {
  return months.find(m => m.month === monthNumber)?.total ?? 0;
}

export function CategoryRow({
  category,
  isExpanded,
  onToggle,
  workspaceId,
  year,
  currency,
}: CategoryRowProps) {
  const hasSubcategories = category.subcategories.length > 0;

  return (
    <>
      {/* Category row */}
      <tr className="bg-default-50 font-medium hover:bg-default-100">
        <td className="sticky left-0 z-10 bg-inherit px-4 py-2">
          <div className="flex items-center gap-2">
            {/* Color indicator */}
            <div
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: category.categoryColor }}
            />
            {/* Expand/collapse button */}
            {hasSubcategories ? (
              <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-1 hover:text-primary justify-start"
              >
                <ChevronDownIcon
                  className={`size-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                />
                <span className="text-sm">{category.categoryName}</span>
              </button>
            ) : (
              <span className="ml-5 text-sm">{category.categoryName}</span>
            )}
          </div>
        </td>
        {/* Month cells */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
          <AmountCell
            key={month}
            amount={getMonthTotal(category.months, month)}
            categoryId={category.categoryId}
            categoryName={category.categoryName}
            subcategoryId={null}
            subcategoryName={null}
            month={month}
            year={year}
            workspaceId={workspaceId}
            currency={currency}
          />
        ))}
        {/* Year total */}
        <td className="px-4 py-2 text-right font-semibold">
          {formatFullCurrency(category.yearTotal, currency)}
        </td>
      </tr>

      {/* Subcategory rows (when expanded) */}
      {isExpanded &&
        category.subcategories.map(subcategory => (
          <SubcategoryRow
            key={subcategory.subcategoryId}
            subcategory={subcategory}
            categoryId={category.categoryId}
            categoryName={category.categoryName}
            workspaceId={workspaceId}
            year={year}
            currency={currency}
          />
        ))}
    </>
  );
}
