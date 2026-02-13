"use client";

import { Button, DatePicker, Select, SelectItem } from "@heroui/react";
import { parseDate, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import type { Account } from "../../accounts/_api/account.types";
import type { Category } from "../../categories/_api/category.types";
import type { TransactionFilters } from "../_api/transaction.types";
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPES } from "../_schemas/transaction.schema";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  accounts: Account[];
  categories: Category[];
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  accounts,
  categories,
}: TransactionFiltersProps) {
  const handleClear = () => {
    onFiltersChange({});
  };

  const hasFilters =
    filters.accountId || filters.categoryId || filters.type || filters.startDate || filters.endDate;

  // Convert Date to CalendarDate for DatePicker
  const dateToCalendarDate = (date: Date | undefined) => {
    if (!date) return null;
    const isoDate = date.toISOString().split("T")[0]!;
    return parseDate(isoDate);
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        label="Account"
        placeholder="All accounts"
        size="sm"
        className="w-48"
        selectedKeys={filters.accountId ? [filters.accountId] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string | undefined;
          onFiltersChange({ ...filters, accountId: value });
        }}
        variant="flat"
      >
        {accounts.map(account => (
          <SelectItem key={account.id}>{account.name}</SelectItem>
        ))}
      </Select>

      <Select
        label="Type"
        placeholder="All types"
        size="sm"
        className="w-40"
        selectedKeys={filters.type ? [filters.type] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as TransactionFilters["type"];
          onFiltersChange({ ...filters, type: value });
        }}
        variant="flat"
      >
        {TRANSACTION_TYPES.map(type => (
          <SelectItem key={type}>{TRANSACTION_TYPE_LABELS[type]}</SelectItem>
        ))}
      </Select>

      <Select
        label="Category"
        placeholder="All categories"
        size="sm"
        className="w-48"
        selectedKeys={filters.categoryId ? [filters.categoryId] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string | undefined;
          onFiltersChange({ ...filters, categoryId: value });
        }}
        variant="flat"
      >
        {categories.map(category => (
          <SelectItem key={category.id}>
            {category.name} ({category.type})
          </SelectItem>
        ))}
      </Select>

      <DatePicker
        label="From"
        size="sm"
        className="w-40"
        granularity="day"
        value={dateToCalendarDate(filters.startDate)}
        onChange={(value: CalendarDate | null) => {
          const date = value ? value.toDate(getLocalTimeZone()) : undefined;
          onFiltersChange({ ...filters, startDate: date });
        }}
        variant="flat"
      />

      <DatePicker
        label="To"
        size="sm"
        className="w-40"
        granularity="day"
        value={dateToCalendarDate(filters.endDate)}
        onChange={(value: CalendarDate | null) => {
          const date = value ? value.toDate(getLocalTimeZone()) : undefined;
          onFiltersChange({ ...filters, endDate: date });
        }}
        variant="flat"
      />

      {hasFilters && (
        <Button size="sm" variant="light" onPress={handleClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
