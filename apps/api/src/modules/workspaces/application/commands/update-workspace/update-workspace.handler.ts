import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Workspace } from "../../../domain/entities";
import { WorkspaceNotFoundError } from "../../../domain/exceptions";
import { WORKSPACE_REPOSITORY, type WorkspaceRepository } from "../../ports";
import { UpdateWorkspaceCommand } from "./update-workspace.command";

export type UpdateWorkspaceResult = ReturnType<Workspace["toPrimitives"]>;

@Injectable()
export class UpdateWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateWorkspaceCommand): Promise<UpdateWorkspaceResult> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError(command.workspaceId);
    }

    const updatedWorkspace = workspace.update({
      name: command.name,
      currency: command.currency,
      timezone: command.timezone,
    });

    const savedWorkspace = await this.workspaceRepository.update(updatedWorkspace);

    this.eventEmitter.emit("workspace.updated", {
      workspaceId: savedWorkspace.id!.value,
    });

    return savedWorkspace.toPrimitives();
  }
}
