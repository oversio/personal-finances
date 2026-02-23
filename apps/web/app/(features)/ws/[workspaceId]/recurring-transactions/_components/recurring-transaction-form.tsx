"use client";

import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLocalTimeZone, parseDate, today, type CalendarDate } from "@internationalized/date";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PlusIcon } from "@repo/ui/icons";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { Account } from "../../accounts/_api/account.types";
import { useAddSubcategory } from "../../categories/_api/add-subcategory/use-add-subcategory";
import type { Category } from "../../categories/_api/category.types";
import { useCreateCategory } from "../../categories/_api/create-category/use-create-category";
import { CategoryFormModal } from "../../categories/_components/category-form-modal";
import { SubcategoryForm } from "../../categories/_components/subcategory-form";
import type {
  CreateCategoryFormData,
  SubcategoryFormData,
} from "../../categories/_schemas/category.schema";
import type { Frequency, RecurringTransaction } from "../_api/recurring-transaction.types";
import {
  createRecurringTransactionSchema,
  DAY_OF_WEEK_LABELS,
  FREQUENCIES,
  FREQUENCY_LABELS,
  MONTH_LABELS,
  RECURRING_TRANSACTION_TYPE_LABELS,
  RECURRING_TRANSACTION_TYPES,
  type CreateRecurringTransactionFormData,
} from "../_schemas/recurring-transaction.schema";

interface RecurringTransactionFormProps {
  workspaceId: string;
  recurringTransaction?: RecurringTransaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: CreateRecurringTransactionFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function RecurringTransactionForm({
  workspaceId,
  recurringTransaction,
  accounts,
  categories,
  onSubmit,
  isPending,
  error,
  submitLabel = "Create Recurring Transaction",
}: RecurringTransactionFormProps) {
  // Modal states for creating categories/subcategories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] =
    useState<Category | null>(null);

  // Category/Subcategory creation hooks
  const createCategoryMutation = useCreateCategory();
  const addSubcategoryMutation = useAddSubcategory();
  const form = useForm<CreateRecurringTransactionFormData>({
    defaultValues: {
      type: recurringTransaction?.type ?? "expense",
      accountId: recurringTransaction?.accountId ?? "",
      categoryId: recurringTransaction?.categoryId ?? "",
      subcategoryId: recurringTransaction?.subcategoryId ?? undefined,
      amount: recurringTransaction?.amount ?? 0,
      currency: (recurringTransaction?.currency ??
        "USD") as CreateRecurringTransactionFormData["currency"],
      notes: recurringTransaction?.notes ?? undefined,
      frequency: recurringTransaction?.schedule.frequency ?? "monthly",
      interval: recurringTransaction?.schedule.interval ?? 1,
      dayOfWeek: recurringTransaction?.schedule.dayOfWeek ?? undefined,
      dayOfMonth: recurringTransaction?.schedule.dayOfMonth ?? undefined,
      monthOfYear: recurringTransaction?.schedule.monthOfYear ?? undefined,
      startDate: recurringTransaction?.startDate ?? new Date(),
      endDate: recurringTransaction?.endDate ?? undefined,
    },
    resolver: zodResolver(createRecurringTransactionSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedType = watch("type");
  const selectedFrequency = watch("frequency");
  const sourceAccountId = watch("accountId");

  const generalError = useServerFormValidationErrors(form, error);

  // Handle category creation success via useEffect
  useEffect(() => {
    if (createCategoryMutation.isSuccess && createCategoryMutation.data) {
      setIsCategoryModalOpen(false);
      setValue("categoryId", createCategoryMutation.data.id);
      setValue("subcategoryId", undefined);
      createCategoryMutation.reset();
    }
  }, [createCategoryMutation, setValue]);

  // Handle subcategory creation success via useEffect
  useEffect(() => {
    if (addSubcategoryMutation.isSuccess && addSubcategoryMutation.data) {
      setIsSubcategoryModalOpen(false);
      setSelectedCategoryForSubcategory(null);
      const updatedCategory = addSubcategoryMutation.data;
      const newSubcategory =
        updatedCategory.subcategories[updatedCategory.subcategories.length - 1];
      if (newSubcategory) {
        setValue("categoryId", updatedCategory.id);
        setValue("subcategoryId", newSubcategory.id);
      }
      addSubcategoryMutation.reset();
    }
  }, [addSubcategoryMutation, setValue]);

  // Auto-fill currency from selected account
  useEffect(() => {
    if (sourceAccountId) {
      const selectedAccount = accounts.find(a => a.id === sourceAccountId);
      if (selectedAccount) {
        setValue(
          "currency",
          selectedAccount.currency as CreateRecurringTransactionFormData["currency"],
        );
      }
    }
  }, [sourceAccountId, accounts, setValue]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => {
    if (selectedType === "income") return c.type === "income";
    if (selectedType === "expense") return c.type === "expense";
    return true;
  });

  // Build composite key for category selection
  const getCategorySelectionKey = () => {
    const categoryId = watch("categoryId");
    const subcategoryId = watch("subcategoryId");
    if (!categoryId) return null;
    if (subcategoryId) return `${categoryId}:${subcategoryId}`;
    return `${categoryId}:`;
  };

  const parseCategorySelection = (key: string) => {
    const [categoryId, subcategoryId] = key.split(":");
    return {
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
    };
  };

  // Handle creating a new category
  const handleCreateCategory = (data: CreateCategoryFormData) => {
    createCategoryMutation.mutate({ workspaceId, data });
  };

  // Handle adding a subcategory to a category
  const handleAddSubcategory = (data: SubcategoryFormData) => {
    if (!selectedCategoryForSubcategory) return;
    addSubcategoryMutation.mutate({
      workspaceId,
      categoryId: selectedCategoryForSubcategory.id,
      data,
    });
  };

  // Open subcategory modal for a specific category
  const openSubcategoryModal = (category: Category) => {
    setSelectedCategoryForSubcategory(category);
    setIsSubcategoryModalOpen(true);
  };

  const customFilter = (textValue: string, inputValue: string) => {
    return textValue.toLowerCase().includes(inputValue.toLowerCase());
  };

  // Determine which schedule fields to show
  const showDayOfWeek = selectedFrequency === "weekly";
  const showDayOfMonth = selectedFrequency === "monthly" || selectedFrequency === "yearly";
  const showMonthOfYear = selectedFrequency === "yearly";

  // Convert Date to CalendarDate for DatePicker
  const dateToCalendarDate = (date: Date) => {
    const isoDate = date.toISOString().split("T")[0]!;
    return parseDate(isoDate);
  };

  const startDateValue = watch("startDate");
  const endDateValue = watch("endDate");
  const startDateCalendar =
    startDateValue instanceof Date ? dateToCalendarDate(startDateValue) : today(getLocalTimeZone());
  const endDateCalendar =
    endDateValue instanceof Date ? dateToCalendarDate(endDateValue) : undefined;

  // Generate day of month options (1-31)
  const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Select
        label="Type"
        placeholder="Select transaction type"
        selectedKeys={[selectedType]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as "income" | "expense";
          if (value) {
            setValue("type", value);
            // Clear category when type changes
            setValue("categoryId", "");
            setValue("subcategoryId", undefined);
          }
        }}
        isInvalid={!!errors.type}
        errorMessage={errors.type?.message}
        isRequired
      >
        {RECURRING_TRANSACTION_TYPES.map(type => (
          <SelectItem key={type}>{RECURRING_TRANSACTION_TYPE_LABELS[type]}</SelectItem>
        ))}
      </Select>

      <Select
        label="Account"
        placeholder="Select account"
        selectedKeys={watch("accountId") ? [watch("accountId")] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string;
          if (value) setValue("accountId", value);
        }}
        isInvalid={!!errors.accountId}
        errorMessage={errors.accountId?.message}
        isRequired
      >
        {accounts.map(account => (
          <SelectItem key={account.id}>{account.name}</SelectItem>
        ))}
      </Select>

      <Autocomplete
        label="Categoría"
        placeholder="Busca o selecciona una categoría"
        selectedKey={getCategorySelectionKey()}
        defaultFilter={customFilter}
        onSelectionChange={key => {
          if (!key) {
            setValue("categoryId", "");
            setValue("subcategoryId", undefined);
            return;
          }

          const keyStr = key as string;

          // Handle "create new category" action
          if (keyStr === "__create_category__") {
            setIsCategoryModalOpen(true);
            return;
          }

          // Handle "add subcategory" action
          if (keyStr.startsWith("__add_subcategory__:")) {
            const categoryId = keyStr.replace("__add_subcategory__:", "");
            const category = filteredCategories.find(c => c.id === categoryId);
            if (category) {
              openSubcategoryModal(category);
            }
            return;
          }

          // Normal category/subcategory selection
          const { categoryId, subcategoryId } = parseCategorySelection(keyStr);
          setValue("categoryId", categoryId ?? "");
          setValue("subcategoryId", subcategoryId);
        }}
        isInvalid={!!errors.categoryId}
        errorMessage={errors.categoryId?.message}
        isRequired
      >
        {(() => {
          const sections = filteredCategories.map(category => {
            const items = [
              ...category.subcategories.map(sub => (
                <AutocompleteItem
                  key={`${category.id}:${sub.id}`}
                  textValue={`${category.name} / ${sub.name}`}
                >
                  {sub.name}
                </AutocompleteItem>
              )),
              <AutocompleteItem
                key={`__add_subcategory__:${category.id}`}
                textValue={`Agregar subcategoría a ${category.name}`}
                className="text-primary"
              >
                <span className="flex items-center gap-2">
                  <PlusIcon className="size-4" />
                  Nueva subcategoría
                </span>
              </AutocompleteItem>,
            ];
            return (
              <AutocompleteSection key={category.id} title={category.name} showDivider>
                {items}
              </AutocompleteSection>
            );
          });

          sections.push(
            <AutocompleteSection key="__create_section__" title="" showDivider={false}>
              <AutocompleteItem
                key="__create_category__"
                textValue="Nueva categoría"
                className="text-primary"
              >
                <span className="flex items-center gap-2 font-medium">
                  <PlusIcon className="size-4" />
                  Nueva categoría
                </span>
              </AutocompleteItem>
            </AutocompleteSection>,
          );

          return sections;
        })()}
      </Autocomplete>

      {/* Category creation modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType={selectedType}
        onSubmit={handleCreateCategory}
        isPending={createCategoryMutation.isPending}
        error={createCategoryMutation.error}
      />

      {/* Subcategory creation modal */}
      <SubcategoryForm
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setSelectedCategoryForSubcategory(null);
        }}
        onSubmit={handleAddSubcategory}
        isPending={addSubcategoryMutation.isPending}
        error={addSubcategoryMutation.error}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Amount"
          placeholder="0.00"
          step="0.01"
          endContent={<span className="text-small text-default-400">{watch("currency")}</span>}
          {...register("amount", { valueAsNumber: true })}
          isInvalid={!!errors.amount}
          errorMessage={errors.amount?.message}
          isRequired
        />

        <DatePicker
          label="Start Date"
          granularity="day"
          value={startDateCalendar}
          onChange={(value: CalendarDate | null) => {
            if (value) {
              setValue("startDate", value.toDate(getLocalTimeZone()));
            }
          }}
          isInvalid={!!errors.startDate}
          errorMessage={errors.startDate?.message}
          isRequired
          showMonthAndYearPickers
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Frequency"
          placeholder="Select frequency"
          selectedKeys={[selectedFrequency]}
          onSelectionChange={keys => {
            const value = Array.from(keys)[0] as Frequency;
            if (value) {
              setValue("frequency", value);
              // Clear schedule fields when frequency changes
              setValue("dayOfWeek", undefined);
              setValue("dayOfMonth", undefined);
              setValue("monthOfYear", undefined);
            }
          }}
          isInvalid={!!errors.frequency}
          errorMessage={errors.frequency?.message}
          isRequired
        >
          {FREQUENCIES.map(freq => (
            <SelectItem key={freq}>{FREQUENCY_LABELS[freq]}</SelectItem>
          ))}
        </Select>

        <Input
          type="number"
          label="Every"
          placeholder="1"
          min={1}
          max={365}
          endContent={
            <span className="text-small text-default-400">
              {selectedFrequency === "daily"
                ? "day(s)"
                : selectedFrequency === "weekly"
                  ? "week(s)"
                  : selectedFrequency === "monthly"
                    ? "month(s)"
                    : "year(s)"}
            </span>
          }
          {...register("interval", { valueAsNumber: true })}
          isInvalid={!!errors.interval}
          errorMessage={errors.interval?.message}
          isRequired
        />
      </div>

      {showDayOfWeek && (
        <Select
          label="Day of Week"
          placeholder="Select day"
          selectedKeys={watch("dayOfWeek") !== undefined ? [String(watch("dayOfWeek"))] : []}
          onSelectionChange={keys => {
            const value = Array.from(keys)[0] as string;
            if (value !== undefined) setValue("dayOfWeek", Number(value));
          }}
          isInvalid={!!errors.dayOfWeek}
          errorMessage={errors.dayOfWeek?.message}
          isRequired
        >
          {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
            <SelectItem key={value}>{label}</SelectItem>
          ))}
        </Select>
      )}

      {showDayOfMonth && (
        <div className={showMonthOfYear ? "grid grid-cols-2 gap-4" : ""}>
          <Select
            label="Day of Month"
            placeholder="Select day"
            selectedKeys={watch("dayOfMonth") !== undefined ? [String(watch("dayOfMonth"))] : []}
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as string;
              if (value !== undefined) setValue("dayOfMonth", Number(value));
            }}
            isInvalid={!!errors.dayOfMonth}
            errorMessage={errors.dayOfMonth?.message}
            isRequired
          >
            {dayOfMonthOptions.map(day => (
              <SelectItem key={String(day)}>{String(day)}</SelectItem>
            ))}
          </Select>

          {showMonthOfYear && (
            <Select
              label="Month"
              placeholder="Select month"
              selectedKeys={
                watch("monthOfYear") !== undefined ? [String(watch("monthOfYear"))] : []
              }
              onSelectionChange={keys => {
                const value = Array.from(keys)[0] as string;
                if (value !== undefined) setValue("monthOfYear", Number(value));
              }}
              isInvalid={!!errors.monthOfYear}
              errorMessage={errors.monthOfYear?.message}
              isRequired
            >
              {Object.entries(MONTH_LABELS).map(([value, label]) => (
                <SelectItem key={value}>{label}</SelectItem>
              ))}
            </Select>
          )}
        </div>
      )}

      <DatePicker
        label="End Date (Optional)"
        granularity="day"
        value={endDateCalendar ?? null}
        onChange={(value: CalendarDate | null) => {
          if (value) {
            setValue("endDate", value.toDate(getLocalTimeZone()));
          } else {
            setValue("endDate", undefined);
          }
        }}
        isInvalid={!!errors.endDate}
        errorMessage={errors.endDate?.message}
        showMonthAndYearPickers
      />

      <Textarea
        label="Notes"
        placeholder="Additional details (optional)"
        {...register("notes")}
        isInvalid={!!errors.notes}
        errorMessage={errors.notes?.message}
        minRows={2}
      />

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      <Button type="submit" color="primary" isLoading={isPending} className="mt-4">
        {submitLabel}
      </Button>
    </form>
  );
}
