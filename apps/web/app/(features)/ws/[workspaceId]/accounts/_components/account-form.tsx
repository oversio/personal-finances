"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { Account } from "../_api/account.types";
import {
  ACCOUNT_TYPE_LABELS,
  CURRENCY_LABELS,
  DEFAULT_COLORS,
  createAccountSchema,
  type CreateAccountFormData,
} from "../_schemas/account.schema";

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: CreateAccountFormData) => void;
  isPending: boolean;
  error: Error | null;
  submitLabel?: string;
}

export function AccountForm({
  account,
  onSubmit,
  isPending,
  error,
  submitLabel = "Crear Cuenta",
}: AccountFormProps) {
  const form = useForm<CreateAccountFormData>({
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? "checking",
      currency: (account?.currency ?? "USD") as CreateAccountFormData["currency"],
      initialBalance: account?.initialBalance ?? 0,
      color: account?.color ?? "#6366F1",
    },
    resolver: zodResolver(createAccountSchema),
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
        label="Nombre de la Cuenta"
        placeholder="Ej: Cuenta Corriente, Ahorros"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="flat"
        isRequired
      />

      <Select
        label="Tipo de Cuenta"
        placeholder="Selecciona un tipo"
        selectedKeys={[watch("type")]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as CreateAccountFormData["type"];
          if (value) setValue("type", value);
        }}
        isInvalid={!!errors.type}
        errorMessage={errors.type?.message}
        variant="flat"
        isRequired
      >
        {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
          <SelectItem key={value}>{label}</SelectItem>
        ))}
      </Select>

      <Select
        label="Moneda"
        placeholder="Selecciona una moneda"
        selectedKeys={[watch("currency")]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as CreateAccountFormData["currency"];
          if (value) setValue("currency", value);
        }}
        isInvalid={!!errors.currency}
        errorMessage={errors.currency?.message}
        variant="flat"
        isRequired
        isDisabled={!!account}
      >
        {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
          <SelectItem key={value}>{label}</SelectItem>
        ))}
      </Select>

      {!account && (
        <Input
          type="number"
          label="Saldo Inicial"
          placeholder="0.00"
          step="0.01"
          {...register("initialBalance", { valueAsNumber: true })}
          isInvalid={!!errors.initialBalance}
          errorMessage={errors.initialBalance?.message}
          variant="flat"
          isRequired
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Color de la Cuenta</label>
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
              aria-label={`Seleccionar color ${color}`}
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
