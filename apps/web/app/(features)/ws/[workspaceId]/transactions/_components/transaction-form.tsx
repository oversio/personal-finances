"use client";

import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  SelectSection,
  Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate, today, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { Account } from "../../accounts/_api/account.types";
import type { Category } from "../../categories/_api/category.types";
import type { Transaction, TransactionType } from "../_api/transaction.types";
import {
  createTransactionSchema,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  type CreateTransactionFormData,
} from "../_schemas/transaction.schema";

interface TransactionFormProps {
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: CreateTransactionFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function TransactionForm({
  transaction,
  accounts,
  categories,
  onSubmit,
  isPending,
  error,
  submitLabel = "Create Transaction",
}: TransactionFormProps) {
  const form = useForm<CreateTransactionFormData>({
    defaultValues: {
      type: transaction?.type ?? "expense",
      accountId: transaction?.accountId ?? "",
      toAccountId: transaction?.toAccountId ?? undefined,
      categoryId: transaction?.categoryId ?? undefined,
      subcategoryId: transaction?.subcategoryId ?? undefined,
      amount: transaction?.amount ?? 0,
      currency: (transaction?.currency ?? "USD") as CreateTransactionFormData["currency"],
      notes: transaction?.notes ?? undefined,
      date: transaction?.date ?? new Date(),
    },
    resolver: zodResolver(createTransactionSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedType = watch("type");
  const sourceAccountId = watch("accountId");

  const generalError = useServerFormValidationErrors(form, error);

  // Auto-fill currency from selected account
  useEffect(() => {
    if (sourceAccountId) {
      const selectedAccount = accounts.find(a => a.id === sourceAccountId);
      if (selectedAccount) {
        setValue("currency", selectedAccount.currency as CreateTransactionFormData["currency"]);
      }
    }
  }, [sourceAccountId, accounts, setValue]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(c => {
    if (selectedType === "transfer") return false;
    if (selectedType === "income") return c.type === "income";
    if (selectedType === "expense") return c.type === "expense";
    return true;
  });

  // Build composite key for category selection (category:subcategory format)
  const getCategorySelectionKey = () => {
    const categoryId = watch("categoryId");
    const subcategoryId = watch("subcategoryId");
    if (!categoryId) return [];
    if (subcategoryId) return [`${categoryId}:${subcategoryId}`];
    return [`${categoryId}:`];
  };

  // Parse composite key back to categoryId and subcategoryId
  const parseCategorySelection = (key: string) => {
    const [categoryId, subcategoryId] = key.split(":");
    return {
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
    };
  };

  // Determine if fields should be shown based on type
  const showToAccount = selectedType === "transfer";
  const showCategory = selectedType === "income" || selectedType === "expense";

  // Filter accounts for toAccountId (exclude source account for transfers)
  const destinationAccounts = accounts.filter(a => a.id !== sourceAccountId);

  // Convert Date to CalendarDate for DatePicker
  const dateToCalendarDate = (date: Date) => {
    const isoDate = date.toISOString().split("T")[0]!;
    return parseDate(isoDate);
  };

  const currentDate = watch("date");
  const dateValue =
    currentDate instanceof Date ? dateToCalendarDate(currentDate) : today(getLocalTimeZone());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Select
        label="Type"
        placeholder="Select transaction type"
        selectedKeys={[selectedType]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as TransactionType;
          if (value) {
            setValue("type", value);
            // Clear conditional fields when type changes
            if (value === "transfer") {
              setValue("categoryId", undefined);
              setValue("subcategoryId", undefined);
            } else {
              setValue("toAccountId", undefined);
            }
          }
        }}
        isInvalid={!!errors.type}
        errorMessage={errors.type?.message}
        variant="flat"
        isRequired
      >
        {TRANSACTION_TYPES.map(type => (
          <SelectItem key={type}>{TRANSACTION_TYPE_LABELS[type]}</SelectItem>
        ))}
      </Select>

      <Select
        label={selectedType === "transfer" ? "From Account" : "Account"}
        placeholder="Select account"
        selectedKeys={watch("accountId") ? [watch("accountId")] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string;
          if (value) setValue("accountId", value);
        }}
        isInvalid={!!errors.accountId}
        errorMessage={errors.accountId?.message}
        variant="flat"
        isRequired
      >
        {accounts.map(account => (
          <SelectItem key={account.id}>{account.name}</SelectItem>
        ))}
      </Select>

      {showToAccount && (
        <Select
          label="To Account"
          placeholder="Select destination account"
          selectedKeys={watch("toAccountId") ? [watch("toAccountId")!] : []}
          onSelectionChange={keys => {
            const value = Array.from(keys)[0] as string;
            setValue("toAccountId", value || undefined);
          }}
          isInvalid={!!errors.toAccountId}
          errorMessage={errors.toAccountId?.message}
          variant="flat"
          isRequired
        >
          {destinationAccounts.map(account => (
            <SelectItem key={account.id}>{account.name}</SelectItem>
          ))}
        </Select>
      )}

      {showCategory && (
        <Select
          label="Category"
          placeholder="Select category"
          selectedKeys={getCategorySelectionKey()}
          onSelectionChange={keys => {
            const key = Array.from(keys)[0] as string;
            if (key) {
              const { categoryId, subcategoryId } = parseCategorySelection(key);
              setValue("categoryId", categoryId);
              setValue("subcategoryId", subcategoryId);
            } else {
              setValue("categoryId", undefined);
              setValue("subcategoryId", undefined);
            }
          }}
          isInvalid={!!errors.categoryId}
          errorMessage={errors.categoryId?.message}
          variant="flat"
          isRequired
        >
          {filteredCategories.flatMap(category => {
            // Build items for this category section
            const items = [
              <SelectItem key={`${category.id}:`}>{category.name} (General)</SelectItem>,
              ...category.subcategories.map(sub => (
                <SelectItem key={`${category.id}:${sub.id}`}>{sub.name}</SelectItem>
              )),
            ];
            return (
              <SelectSection key={category.id} title={category.name} showDivider>
                {items}
              </SelectSection>
            );
          })}
        </Select>
      )}

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
          variant="flat"
          isRequired
        />

        <DatePicker
          label="Date"
          granularity="day"
          value={dateValue}
          onChange={(value: CalendarDate | null) => {
            if (value) {
              setValue("date", value.toDate(getLocalTimeZone()));
            }
          }}
          isInvalid={!!errors.date}
          errorMessage={errors.date?.message}
          variant="flat"
          isRequired
          showMonthAndYearPickers
        />
      </div>

      <Textarea
        label="Notes"
        placeholder="Additional details (optional)"
        {...register("notes")}
        isInvalid={!!errors.notes}
        errorMessage={errors.notes?.message}
        variant="flat"
        minRows={2}
      />

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      <Button type="submit" color="primary" isLoading={isPending} className="mt-4">
        {submitLabel}
      </Button>
    </form>
  );
}
