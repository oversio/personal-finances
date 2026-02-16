"use client";

import { Button, Chip, Spinner, Tooltip } from "@heroui/react";
import { useState } from "react";
import type { PendingInvitation } from "../_api/settings.types";
import { useGetPendingInvitationList } from "../_api/get-pending-invitation-list/use-get-pending-invitation-list";
import { useResendInvitation } from "../_api/resend-invitation/use-resend-invitation";
import { useRevokeInvitation } from "../_api/revoke-invitation/use-revoke-invitation";
import { RevokeInvitationModal } from "./revoke-invitation-modal";

interface PendingInvitationsTableProps {
  workspaceId: string;
}

export function PendingInvitationsTable({ workspaceId }: PendingInvitationsTableProps) {
  const { data: invitations, isLoading } = useGetPendingInvitationList(workspaceId);
  const resendMutation = useResendInvitation();
  const revokeMutation = useRevokeInvitation();

  const [invitationToRevoke, setInvitationToRevoke] = useState<PendingInvitation | null>(null);

  const handleResend = (invitation: PendingInvitation) => {
    resendMutation.mutate({
      workspaceId,
      invitationId: invitation.id,
    });
  };

  const handleRevoke = () => {
    if (!invitationToRevoke) return;
    revokeMutation.mutate(
      { workspaceId, invitationId: invitationToRevoke.id },
      {
        onSuccess: () => {
          setInvitationToRevoke(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <p className="py-4 text-center text-small text-default-500">No hay invitaciones pendientes</p>
    );
  }

  return (
    <>
      <div className="divide-y divide-divider">
        {invitations.map(invitation => (
          <InvitationRow
            key={invitation.id}
            invitation={invitation}
            onResend={handleResend}
            onRevoke={setInvitationToRevoke}
            isResending={resendMutation.isPending}
          />
        ))}
      </div>

      <RevokeInvitationModal
        invitation={invitationToRevoke}
        isOpen={!!invitationToRevoke}
        onClose={() => setInvitationToRevoke(null)}
        onConfirm={handleRevoke}
        isPending={revokeMutation.isPending}
      />
    </>
  );
}

interface InvitationRowProps {
  invitation: PendingInvitation;
  onResend: (invitation: PendingInvitation) => void;
  onRevoke: (invitation: PendingInvitation) => void;
  isResending: boolean;
}

function InvitationRow({ invitation, onResend, onRevoke, isResending }: InvitationRowProps) {
  const expiresAt = new Date(invitation.expiresAt);
  const isExpired = invitation.isExpired;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-CL", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{invitation.email}</span>
          <Chip
            size="sm"
            variant="flat"
            color={invitation.role === "admin" ? "secondary" : "default"}
          >
            {invitation.role === "admin" ? "Administrador" : "Miembro"}
          </Chip>
          {isExpired && (
            <Chip size="sm" variant="flat" color="warning">
              Expirada
            </Chip>
          )}
        </div>
        <span className="text-small text-default-500">
          {isExpired ? "Expiró el" : "Expira el"} {formatDate(expiresAt)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip content={isExpired ? "Enviar nueva invitación" : "Reenviar invitación"}>
          <Button
            size="sm"
            variant="flat"
            isLoading={isResending}
            onPress={() => onResend(invitation)}
          >
            Reenviar
          </Button>
        </Tooltip>
        <Tooltip content="Revocar invitación" color="danger">
          <Button size="sm" variant="flat" color="danger" onPress={() => onRevoke(invitation)}>
            Revocar
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
