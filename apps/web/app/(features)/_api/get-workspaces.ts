import { fetcher, listOf } from "@/_commons/api";
import { WorkspaceSchema } from "./workspace.types";

export async function getWorkspaces() {
  return fetcher("/workspaces", {
    method: "GET",
    schema: listOf(WorkspaceSchema),
  });
}
