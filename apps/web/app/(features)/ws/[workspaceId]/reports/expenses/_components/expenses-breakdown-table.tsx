"use client";

import { Button, Select, SelectItem, Spinner } from "@heroui/react";
import { useMemo, useState } from "react";
import { useGetAccountList } from "../../../accounts/_api/get-account-list/use-get-account-list";
import { useGetExpensesBreakdown } from "../../_api/get-expenses-breakdown/use-get-expenses-breakdown";
import { CategoryRow } from "./category-row";
import { TotalRow } from "./total-row";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

interface ExpensesBreakdownTableProps {
  workspaceId: string;
}

export function ExpensesBreakdownTable({ workspaceId }: ExpensesBreakdownTableProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(undefined);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get accounts to derive available currencies
  const { data: accounts } = useGetAccountList({ workspaceId });

  // Derive unique currencies from accounts, prioritizing CLP
  const availableCurrencies = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    const currencies = [...new Set(accounts.map(a => a.currency))].sort((a, b) => {
      // Prioritize CLP first
      if (a === "CLP") return -1;
      if (b === "CLP") return 1;
      return a.localeCompare(b);
    });
    return currencies;
  }, [accounts]);

  // Set default currency when currencies are loaded
  const effectiveCurrency = selectedCurrency ?? availableCurrencies[0];

  const { data, isLoading, error } = useGetExpensesBreakdown({
    workspaceId,
    year: selectedYear,
    currency: effectiveCurrency,
  });

  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (data) {
      setExpandedCategories(new Set(data.categories.map(c => c.categoryId)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const hasData = data && data.categories.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            aria-label="Seleccionar año"
            placeholder="Año"
            selectedKeys={[String(selectedYear)]}
            onSelectionChange={keys => {
              const year = Array.from(keys)[0];
              if (year) setSelectedYear(Number(year));
            }}
            className="w-28"
            size="sm"
            variant="flat"
            disallowEmptySelection
          >
            {availableYears.map(year => (
              <SelectItem key={String(year)}>{String(year)}</SelectItem>
            ))}
          </Select>
          {availableCurrencies.length > 1 && (
            <Select
              aria-label="Seleccionar moneda"
              placeholder="Moneda"
              selectedKeys={effectiveCurrency ? [effectiveCurrency] : []}
              onSelectionChange={keys => {
                const currency = Array.from(keys)[0];
                if (currency) setSelectedCurrency(String(currency));
              }}
              className="w-24"
              size="sm"
              variant="flat"
              disallowEmptySelection
            >
              {availableCurrencies.map(currency => (
                <SelectItem key={currency}>{currency}</SelectItem>
              ))}
            </Select>
          )}
          <div className="flex gap-1">
            <Button size="sm" variant="flat" onPress={expandAll} isDisabled={!hasData}>
              Expandir todo
            </Button>
            <Button size="sm" variant="flat" onPress={collapseAll} isDisabled={!hasData}>
              Colapsar todo
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
          <p>Error al cargar el reporte. Por favor intenta de nuevo.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !hasData && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-default-300 py-12">
          <svg
            className="size-12 text-default-300"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Sin gastos en {selectedYear}</h3>
            <p className="text-small text-default-500">
              No hay transacciones de gastos registradas para este año
            </p>
          </div>
        </div>
      )}

      {/* Table - Only when we have data */}
      {hasData && (
        <div className="overflow-x-auto rounded-lg border border-default-200">
          <table className="w-full min-w-225 border-collapse">
            <thead>
              <tr className="bg-default-100">
                <th className="sticky left-0 z-10 min-w-50 bg-default-100 px-4 py-3 text-left text-sm font-semibold">
                  Categoría
                </th>
                {MONTHS.map(month => (
                  <th
                    key={month}
                    className="min-w-20 pl-2 pr-4 py-3 text-right text-sm font-semibold"
                  >
                    {month}
                  </th>
                ))}
                <th className="min-w-25 px-4 py-3 text-right text-sm font-semibold">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100">
              {data.categories.map(category => (
                <CategoryRow
                  key={category.categoryId}
                  category={category}
                  isExpanded={expandedCategories.has(category.categoryId)}
                  onToggle={() => toggleCategory(category.categoryId)}
                  workspaceId={workspaceId}
                  year={selectedYear}
                  currency={effectiveCurrency}
                />
              ))}
            </tbody>
            <tfoot>
              <TotalRow
                monthlyTotals={data.monthlyTotals}
                grandTotal={data.grandTotal}
                currency={effectiveCurrency}
              />
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
