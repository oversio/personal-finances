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
import { parseDate, today, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import type { Transaction, TransactionType } from "../_api/transaction.types";
import {
  createTransactionSchema,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  type CreateTransactionFormData,
} from "../_schemas/transaction.schema";

interface TransactionFormProps {
  workspaceId: string;
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: CreateTransactionFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function TransactionForm({
  workspaceId,
  transaction,
  accounts,
  categories,
  onSubmit,
  isPending,
  error,
  submitLabel = "Crear Transacción",
}: TransactionFormProps) {
  // Modal states for creating categories/subcategories
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] =
    useState<Category | null>(null);

  // Category/Subcategory creation hooks
  const createCategoryMutation = useCreateCategory();
  const addSubcategoryMutation = useAddSubcategory();

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

  // Handle category creation success via useEffect (more reliable with 401 retry flow)
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
    if (!categoryId) return null;
    if (subcategoryId) return `${categoryId}:${subcategoryId}`;
    return `${categoryId}:`;
  };

  // Parse composite key back to categoryId and subcategoryId
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

  const customFilter = (textValue: string, inputValue: string) => {
    return textValue.toLowerCase().includes(inputValue.toLowerCase());
  };

  const currentDate = watch("date");
  const dateValue =
    currentDate instanceof Date ? dateToCalendarDate(currentDate) : today(getLocalTimeZone());

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Select
        label="Tipo"
        placeholder="Selecciona un tipo"
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
        label={selectedType === "transfer" ? "Desde Cuenta" : "Cuenta"}
        placeholder="Selecciona una cuenta"
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
          label="Hacia Cuenta"
          placeholder="Selecciona cuenta de destino"
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
        <>
          <Autocomplete
            label="Categoría"
            placeholder="Busca o selecciona una categoría"
            selectedKey={getCategorySelectionKey()}
            defaultFilter={customFilter}
            onSelectionChange={key => {
              if (!key) {
                setValue("categoryId", undefined);
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
              setValue("categoryId", categoryId);
              setValue("subcategoryId", subcategoryId);
            }}
            isInvalid={!!errors.categoryId}
            errorMessage={errors.categoryId?.message}
            variant="flat"
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
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
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
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
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
            defaultType={selectedType === "income" ? "income" : "expense"}
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
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Monto"
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
          label="Fecha"
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
        label="Notas"
        placeholder="Detalles adicionales (opcional)"
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
