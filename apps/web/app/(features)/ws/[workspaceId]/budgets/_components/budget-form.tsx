"use client";

import { Button, DatePicker, Input, Select, SelectItem, Switch } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, today, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import { useGetCategoryList } from "../../categories/_api/get-category-list/use-get-category-list";
import type { Budget } from "../_api/budget.types";
import {
  BUDGET_PERIOD_LABELS,
  createBudgetSchema,
  type CreateBudgetFormData,
} from "../_schemas/budget.schema";

interface BudgetFormProps {
  budget?: Budget;
  workspaceId: string;
  onSubmit: (data: CreateBudgetFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function BudgetForm({
  budget,
  workspaceId,
  onSubmit,
  isPending,
  error,
  submitLabel = "Create Budget",
}: BudgetFormProps) {
  // Fetch expense categories for the dropdown (budgets are typically for expenses)
  const { data: categories, isLoading: categoriesLoading } = useGetCategoryList({
    workspaceId,
    type: "expense",
  });

  const form = useForm<CreateBudgetFormData>({
    defaultValues: {
      categoryId: budget?.categoryId ?? "",
      subcategoryId: budget?.subcategoryId ?? undefined,
      name: budget?.name ?? "",
      amount: budget?.amount ?? 0,
      period: budget?.period ?? "monthly",
      startDate: budget?.startDate ?? new Date(),
      alertThreshold: budget?.alertThreshold ?? undefined,
    },
    resolver: zodResolver(createBudgetSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);
  const hasSubcategories =
    selectedCategory?.subcategories && selectedCategory.subcategories.length > 0;
  const showAlertThreshold = watch("alertThreshold") !== undefined;

  // Convert Date to CalendarDate for DatePicker
  const dateToCalendarDate = (date: Date) => {
    const isoDate = date.toISOString().split("T")[0]!;
    return parseDate(isoDate);
  };

  const currentStartDate = watch("startDate");
  const startDateValue =
    currentStartDate instanceof Date
      ? dateToCalendarDate(currentStartDate)
      : today(getLocalTimeZone());

  const generalError = useServerFormValidationErrors(form, error);

  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId);
    setValue("subcategoryId", undefined); // Reset subcategory when category changes
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Input
        label="Budget Name"
        placeholder="e.g., Monthly Groceries, Entertainment"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="flat"
        isRequired
      />

      <Select
        label="Category"
        placeholder="Select a category"
        selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string;
          if (value) handleCategoryChange(value);
        }}
        isInvalid={!!errors.categoryId}
        errorMessage={errors.categoryId?.message}
        variant="flat"
        isRequired
        isLoading={categoriesLoading}
        isDisabled={!!budget} // Can't change category on edit
      >
        {(categories ?? []).map(category => (
          <SelectItem key={category.id}>{category.name}</SelectItem>
        ))}
      </Select>

      {hasSubcategories && !budget && (
        <Select
          label="Subcategory (Optional)"
          placeholder="All subcategories"
          selectedKeys={watch("subcategoryId") ? [watch("subcategoryId")!] : []}
          onSelectionChange={keys => {
            const value = Array.from(keys)[0] as string;
            setValue("subcategoryId", value || undefined);
          }}
          variant="flat"
        >
          {selectedCategory!.subcategories.map(sub => (
            <SelectItem key={sub.id}>{sub.name}</SelectItem>
          ))}
        </Select>
      )}

      <Input
        type="number"
        label="Budget Amount"
        placeholder="0.00"
        step="0.01"
        {...register("amount", { valueAsNumber: true })}
        isInvalid={!!errors.amount}
        errorMessage={errors.amount?.message}
        variant="flat"
        isRequired
      />

      <Select
        label="Period"
        placeholder="Select period"
        selectedKeys={[watch("period")]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as CreateBudgetFormData["period"];
          if (value) setValue("period", value);
        }}
        isInvalid={!!errors.period}
        errorMessage={errors.period?.message}
        variant="flat"
        isRequired
      >
        {Object.entries(BUDGET_PERIOD_LABELS).map(([value, label]) => (
          <SelectItem key={value}>{label}</SelectItem>
        ))}
      </Select>

      <DatePicker
        label="Start Date"
        granularity="day"
        value={startDateValue}
        onChange={(value: CalendarDate | null) => {
          if (value) {
            setValue("startDate", value.toDate(getLocalTimeZone()));
          }
        }}
        isInvalid={!!errors.startDate}
        errorMessage={errors.startDate?.message}
        variant="flat"
        isRequired
        isDisabled={!!budget} // Can't change start date on edit
        showMonthAndYearPickers
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Alert Threshold</p>
            <p className="text-tiny text-default-400">
              Get notified when spending reaches a percentage
            </p>
          </div>
          <Switch
            isSelected={showAlertThreshold}
            onValueChange={checked => {
              setValue("alertThreshold", checked ? 80 : undefined);
            }}
          />
        </div>
        {showAlertThreshold && (
          <Input
            type="number"
            placeholder="80"
            min={1}
            max={100}
            {...register("alertThreshold", { valueAsNumber: true })}
            isInvalid={!!errors.alertThreshold}
            errorMessage={errors.alertThreshold?.message}
            variant="flat"
            endContent={<span className="text-default-400">%</span>}
          />
        )}
      </div>

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      <Button type="submit" color="primary" isLoading={isPending} className="mt-4">
        {submitLabel}
      </Button>
    </form>
  );
}
