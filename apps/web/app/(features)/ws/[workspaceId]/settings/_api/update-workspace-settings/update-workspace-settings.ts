import { fetcher } from "@/_commons/api";
import { WorkspaceSettingsSchema, type UpdateWorkspaceSettingsInput } from "../settings.types";

export interface UpdateWorkspaceSettingsParams {
  workspaceId: string;
  data: UpdateWorkspaceSettingsInput;
}

export async function updateWorkspaceSettings({
  workspaceId,
  data,
}: UpdateWorkspaceSettingsParams) {
  return fetcher(`/ws/${workspaceId}/settings`, {
    method: "PUT",
    body: data,
    schema: WorkspaceSettingsSchema,
  });
}
