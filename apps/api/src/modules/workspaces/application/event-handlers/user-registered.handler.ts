import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CreateWorkspaceCommand } from "../commands/create-workspace/create-workspace.command";
import { CreateWorkspaceHandler } from "../commands/create-workspace/create-workspace.handler";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  provider: string;
}

@Injectable()
export class UserRegisteredHandler {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(private readonly createWorkspaceHandler: CreateWorkspaceHandler) {}

  @OnEvent("user.registered")
  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`Creating default workspace for user ${event.userId}`);

    await this.createWorkspaceHandler.execute(
      new CreateWorkspaceCommand(
        "Personal",
        event.userId,
        "USD",
        undefined,
        true, // isDefault
      ),
    );

    this.logger.log(`Successfully created default workspace for user ${event.userId}`);
  }
}
