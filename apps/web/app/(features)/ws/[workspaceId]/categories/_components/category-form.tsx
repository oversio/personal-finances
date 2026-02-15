"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { Category } from "../_api/category.types";
import {
  CATEGORY_TYPE_LABELS,
  DEFAULT_COLORS,
  createCategorySchema,
  type CreateCategoryFormData,
} from "../_schemas/category.schema";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function CategoryForm({
  category,
  onSubmit,
  isPending,
  error,
  submitLabel = "Create Category",
}: CategoryFormProps) {
  const form = useForm<CreateCategoryFormData>({
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? "expense",
      color: category?.color ?? "#6366F1",
      icon: category?.icon ?? undefined,
    },
    resolver: zodResolver(createCategorySchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedColor = watch("color");

  const generalError = useServerFormValidationErrors(form, error);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Input
        label="Category Name"
        placeholder="e.g., Food & Dining, Salary"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="flat"
        isRequired
      />

      <Select
        label="Category Type"
        placeholder="Select category type"
        selectedKeys={[watch("type")]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as CreateCategoryFormData["type"];
          if (value) setValue("type", value);
        }}
        isInvalid={!!errors.type}
        errorMessage={errors.type?.message}
        variant="flat"
        isRequired
      >
        {Object.entries(CATEGORY_TYPE_LABELS).map(([value, label]) => (
          <SelectItem key={value}>{label}</SelectItem>
        ))}
      </Select>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Color</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className="size-8 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                outline: selectedColor === color ? "2px solid currentColor" : "none",
                outlineOffset: "2px",
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        {errors.color && <p className="text-small text-danger">{errors.color.message}</p>}
      </div>

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      <Button type="submit" color="primary" isLoading={isPending} className="mt-4">
        {submitLabel}
      </Button>
    </form>
  );
}
