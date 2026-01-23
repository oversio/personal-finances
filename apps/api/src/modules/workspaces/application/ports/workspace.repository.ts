import { Workspace } from "../../domain/entities";

export const WORKSPACE_REPOSITORY = Symbol("WORKSPACE_REPOSITORY");

export interface WorkspaceRepository {
  save(workspace: Workspace): Promise<Workspace>;
  findById(id: string): Promise<Workspace | null>;
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  update(workspace: Workspace): Promise<Workspace>;
  delete(id: string): Promise<void>;
}
