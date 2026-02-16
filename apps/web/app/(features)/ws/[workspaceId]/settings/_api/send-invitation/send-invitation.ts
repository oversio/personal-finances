import { fetcher } from "@/_commons/api";
import {
  SendInvitationResultSchema,
  type SendInvitationInput,
  type SendInvitationResult,
} from "../settings.types";

export interface SendInvitationParams {
  workspaceId: string;
  data: SendInvitationInput;
}

export async function sendInvitation({
  workspaceId,
  data,
}: SendInvitationParams): Promise<SendInvitationResult> {
  return fetcher(`/ws/${workspaceId}/invitations`, {
    method: "POST",
    body: data,
    schema: SendInvitationResultSchema,
  });
}
