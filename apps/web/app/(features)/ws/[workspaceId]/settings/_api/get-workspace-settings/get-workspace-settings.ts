import { fetcher } from "@/_commons/api";
import { WorkspaceSettingsSchema } from "../settings.types";

export interface GetWorkspaceSettingsParams {
  workspaceId: string;
}

export async function getWorkspaceSettings({ workspaceId }: GetWorkspaceSettingsParams) {
  return fetcher(`/ws/${workspaceId}/settings`, {
    method: "GET",
    schema: WorkspaceSettingsSchema,
  });
}
