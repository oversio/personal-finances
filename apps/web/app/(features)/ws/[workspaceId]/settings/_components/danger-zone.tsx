"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteWorkspace } from "../_api/delete-workspace/use-delete-workspace";
import { DeleteWorkspaceModal } from "./delete-workspace-modal";

interface DangerZoneProps {
  workspaceId: string;
  workspaceName: string;
}

export function DangerZone({ workspaceId, workspaceName }: DangerZoneProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const handleDelete = () => {
    deleteWorkspaceMutation.mutate(
      { workspaceId },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          // Redirect to home after deletion
          router.push("/");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-6 dark:border-danger-800 dark:bg-danger-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-danger">Eliminar este espacio de trabajo</h3>
            <p className="text-small text-danger-600 dark:text-danger-400">
              Una vez que elimines un espacio de trabajo, no hay vuelta atrás. Por favor, asegúrate.
            </p>
          </div>
          <Button
            color="danger"
            variant="bordered"
            onPress={() => setShowDeleteModal(true)}
            className="shrink-0"
          >
            Eliminar Espacio de Trabajo
          </Button>
        </div>
      </div>

      <DeleteWorkspaceModal
        workspaceName={workspaceName}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isPending={deleteWorkspaceMutation.isPending}
      />
    </div>
  );
}
