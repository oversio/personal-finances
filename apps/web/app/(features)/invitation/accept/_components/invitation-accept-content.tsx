"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Spinner, Chip } from "@heroui/react";
import { useAuthStore, selectIsAuthenticated, selectUser } from "@/_commons/stores/auth.store";
import { useGetInvitation } from "../../_api/get-invitation/use-get-invitation";
import { useAcceptInvitation } from "../../_api/accept-invitation/use-accept-invitation";
import { ApiError } from "@/_commons/api";
import type { InvitationStatus } from "../../_api/invitation.types";

interface Props {
  token: string;
}

export function InvitationAcceptContent({ token }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);

  const { data: invitation, isLoading, error } = useGetInvitation(token);
  const {
    mutate: acceptInvitation,
    isPending: isAccepting,
    error: acceptError,
  } = useAcceptInvitation();

  const handleAccept = () => {
    acceptInvitation(token, {
      onSuccess: result => {
        router.push(`/ws/${result.workspaceId}/dashboard`);
      },
    });
  };

  const handleSignIn = () => {
    const redirectUrl = `/invitation/accept?token=${token}`;
    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  const handleRegister = () => {
    const redirectUrl = `/invitation/accept?token=${token}`;
    router.push(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  if (isLoading) {
    return (
      <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof ApiError ? error.message : "Error al cargar los detalles de la invitación";

    return (
      <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
        <CardBody className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-danger">Invitación No Encontrada</h1>
          <p className="text-default-500">{errorMessage}</p>
        </CardBody>
      </Card>
    );
  }

  if (!invitation) {
    return null;
  }

  const statusContent = getStatusContent(invitation.status, invitation.workspaceName);

  if (statusContent) {
    return (
      <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
        <CardBody className="text-center">
          <h1 className={`mb-2 text-xl font-semibold ${statusContent.titleClass}`}>
            {statusContent.title}
          </h1>
          <p className="text-default-500">{statusContent.message}</p>
        </CardBody>
      </Card>
    );
  }

  // Check email mismatch
  const emailMismatch =
    isAuthenticated && user?.email?.toLowerCase() !== invitation.email.toLowerCase();

  // Get accept error message
  const acceptErrorMessage =
    acceptError instanceof ApiError ? acceptError.message : acceptError?.message;

  return (
    <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
      <CardHeader className="flex flex-col gap-1 pb-0">
        <h1 className="text-2xl font-bold">Invitación al Espacio de Trabajo</h1>
        <p className="text-small text-default-500">Has sido invitado a unirte a un espacio de trabajo</p>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 pt-4">
        <div className="rounded-lg bg-default-100 p-4">
          <div className="mb-3">
            <span className="text-small text-default-500">Espacio de Trabajo</span>
            <p className="font-semibold">{invitation.workspaceName}</p>
          </div>
          <div className="mb-3">
            <span className="text-small text-default-500">Rol</span>
            <div className="mt-1">
              <Chip
                size="sm"
                variant="flat"
                color={invitation.role === "admin" ? "secondary" : "default"}
              >
                {invitation.role === "admin" ? "Administrador" : "Miembro"}
              </Chip>
            </div>
          </div>
          <div>
            <span className="text-small text-default-500">Invitado por</span>
            <p>{invitation.invitedByName}</p>
          </div>
        </div>

        {emailMismatch && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3">
            <p className="text-small text-warning-700">
              Esta invitación fue enviada a <strong>{invitation.email}</strong>, pero has iniciado
              sesión como <strong>{user?.email}</strong>. Necesitas iniciar sesión con el correo
              correcto para aceptar esta invitación.
            </p>
          </div>
        )}

        {acceptErrorMessage && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3">
            <p className="text-small text-danger-700">{acceptErrorMessage}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-small text-default-500">
              Inicia sesión para aceptar esta invitación
            </p>
            <Button color="primary" onPress={handleSignIn}>
              Iniciar Sesión
            </Button>
            <Button variant="flat" onPress={handleRegister}>
              Crear Cuenta
            </Button>
          </div>
        ) : emailMismatch ? (
          <Button variant="flat" onPress={handleSignIn}>
            Iniciar sesión con otra cuenta
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={handleAccept}
            isLoading={isAccepting}
            isDisabled={isAccepting}
          >
            Aceptar Invitación
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function getStatusContent(status: InvitationStatus, workspaceName: string) {
  switch (status) {
    case "accepted":
      return {
        title: "Ya Aceptada",
        message: `Esta invitación a ${workspaceName} ya ha sido aceptada.`,
        titleClass: "text-success",
      };
    case "expired":
      return {
        title: "Invitación Expirada",
        message:
          "Esta invitación ha expirado. Por favor, pide al administrador del espacio de trabajo que envíe una nueva invitación.",
        titleClass: "text-warning",
      };
    case "revoked":
      return {
        title: "Invitación Revocada",
        message: "Esta invitación ha sido revocada por el administrador del espacio de trabajo.",
        titleClass: "text-danger",
      };
    case "pending":
      return null;
    default:
      return null;
  }
}
