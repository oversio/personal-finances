"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import type { WorkspaceSettings } from "../_api/settings.types";
import {
  COMMON_TIMEZONES,
  CURRENCY_LABELS,
  generalSettingsSchema,
  TIMEZONE_LABELS,
  type GeneralSettingsFormData,
} from "../_schemas/general-settings.schema";

interface GeneralSettingsFormProps {
  settings: WorkspaceSettings;
  onSubmit: (data: GeneralSettingsFormData) => void;
  isPending: boolean;
  error: Error | null;
  canEdit: boolean;
}

export function GeneralSettingsForm({
  settings,
  onSubmit,
  isPending,
  error,
  canEdit,
}: GeneralSettingsFormProps) {
  const form = useForm<GeneralSettingsFormData>({
    defaultValues: {
      name: settings.name,
      currency: settings.currency as GeneralSettingsFormData["currency"],
      timezone: settings.timezone ?? undefined,
    },
    resolver: zodResolver(generalSettingsSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form;

  const generalError = useServerFormValidationErrors(form, error);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Input
        label="Workspace Name"
        placeholder="e.g., Personal Finances, Family Budget"
        {...register("name")}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        variant="flat"
        isRequired
        isDisabled={!canEdit}
      />

      <Select
        label="Currency"
        placeholder="Select currency"
        selectedKeys={[watch("currency")]}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as GeneralSettingsFormData["currency"];
          if (value) setValue("currency", value, { shouldDirty: true });
        }}
        isInvalid={!!errors.currency}
        errorMessage={errors.currency?.message}
        variant="flat"
        isRequired
        isDisabled={!canEdit}
      >
        {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
          <SelectItem key={value}>{label}</SelectItem>
        ))}
      </Select>

      <Select
        label="Timezone"
        placeholder="Select timezone"
        selectedKeys={watch("timezone") ? [watch("timezone")!] : []}
        onSelectionChange={keys => {
          const value = Array.from(keys)[0] as string;
          setValue("timezone", value, { shouldDirty: true });
        }}
        isInvalid={!!errors.timezone}
        errorMessage={errors.timezone?.message}
        variant="flat"
        isDisabled={!canEdit}
      >
        {COMMON_TIMEZONES.map(tz => (
          <SelectItem key={tz}>{TIMEZONE_LABELS[tz]}</SelectItem>
        ))}
      </Select>

      {generalError && <p className="text-small text-danger">{generalError}</p>}

      {canEdit && (
        <Button
          type="submit"
          color="primary"
          isLoading={isPending}
          isDisabled={!isDirty}
          className="mt-2 w-fit"
        >
          Save Changes
        </Button>
      )}
    </form>
  );
}
