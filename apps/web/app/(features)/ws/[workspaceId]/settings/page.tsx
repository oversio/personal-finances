"use client";

import { Spinner, Tab, Tabs } from "@heroui/react";
import { useParams } from "next/navigation";
import { useGetWorkspaceSettings } from "./_api/get-workspace-settings/use-get-workspace-settings";
import { useUpdateWorkspaceSettings } from "./_api/update-workspace-settings/use-update-workspace-settings";
import { DangerZone } from "./_components/danger-zone";
import { GeneralSettingsForm } from "./_components/general-settings-form";
import { MembersSection } from "./_components/members-section";
import type { GeneralSettingsFormData } from "./_schemas/general-settings.schema";

export default function SettingsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  const { data: settings, isLoading, error } = useGetWorkspaceSettings({ workspaceId });
  const updateSettingsMutation = useUpdateWorkspaceSettings();

  const handleUpdateSettings = (data: GeneralSettingsFormData) => {
    updateSettingsMutation.mutate({ workspaceId, data });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-danger">Error al cargar la configuración del espacio de trabajo</p>
        <p className="text-small text-default-500">Por favor intenta de nuevo más tarde</p>
      </div>
    );
  }

  const currentUserRole = settings.currentUserRole;
  const isOwner = currentUserRole === "owner";
  const canEdit = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Configuración</h1>

      <Tabs aria-label="Secciones de configuración" variant="underlined" classNames={{ tabList: "mb-6" }}>
        <Tab key="general" title="General">
          <div className="rounded-lg border border-divider bg-content1 p-6">
            <h2 className="mb-4 text-lg font-semibold">Configuración General</h2>
            <GeneralSettingsForm
              settings={settings}
              onSubmit={handleUpdateSettings}
              isPending={updateSettingsMutation.isPending}
              error={updateSettingsMutation.error}
              canEdit={canEdit}
            />
          </div>
        </Tab>

        <Tab key="members" title="Miembros">
          <MembersSection workspaceId={workspaceId} currentUserRole={currentUserRole} />
        </Tab>

        {isOwner && (
          <Tab key="danger" title="Zona de Peligro">
            <DangerZone workspaceId={workspaceId} workspaceName={settings.name} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
