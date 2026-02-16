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
      error instanceof ApiError ? error.message : "Failed to load invitation details";

    return (
      <Card className="mx-auto mt-20 max-w-md p-4 shadow-lg">
        <CardBody className="text-center">
          <h1 className="mb-2 text-xl font-semibold text-danger">Invitation Not Found</h1>
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
        <h1 className="text-2xl font-bold">Workspace Invitation</h1>
        <p className="text-small text-default-500">You&apos;ve been invited to join a workspace</p>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 pt-4">
        <div className="rounded-lg bg-default-100 p-4">
          <div className="mb-3">
            <span className="text-small text-default-500">Workspace</span>
            <p className="font-semibold">{invitation.workspaceName}</p>
          </div>
          <div className="mb-3">
            <span className="text-small text-default-500">Role</span>
            <div className="mt-1">
              <Chip
                size="sm"
                variant="flat"
                color={invitation.role === "admin" ? "secondary" : "default"}
              >
                {invitation.role}
              </Chip>
            </div>
          </div>
          <div>
            <span className="text-small text-default-500">Invited by</span>
            <p>{invitation.invitedByName}</p>
          </div>
        </div>

        {emailMismatch && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3">
            <p className="text-small text-warning-700">
              This invitation was sent to <strong>{invitation.email}</strong>, but you&apos;re
              signed in as <strong>{user?.email}</strong>. You need to sign in with the correct
              email to accept this invitation.
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
              Sign in to accept this invitation
            </p>
            <Button color="primary" onPress={handleSignIn}>
              Sign In
            </Button>
            <Button variant="flat" onPress={handleRegister}>
              Create Account
            </Button>
          </div>
        ) : emailMismatch ? (
          <Button variant="flat" onPress={handleSignIn}>
            Sign in with different account
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={handleAccept}
            isLoading={isAccepting}
            isDisabled={isAccepting}
          >
            Accept Invitation
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
        title: "Already Accepted",
        message: `This invitation to ${workspaceName} has already been accepted.`,
        titleClass: "text-success",
      };
    case "expired":
      return {
        title: "Invitation Expired",
        message:
          "This invitation has expired. Please ask the workspace admin to send a new invitation.",
        titleClass: "text-warning",
      };
    case "revoked":
      return {
        title: "Invitation Revoked",
        message: "This invitation has been revoked by the workspace admin.",
        titleClass: "text-danger",
      };
    case "pending":
      return null;
    default:
      return null;
  }
}
