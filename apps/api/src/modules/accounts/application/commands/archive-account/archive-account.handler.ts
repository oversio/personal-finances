import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AccountNotFoundError } from "../../../domain/exceptions";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "../../ports";
import { ArchiveAccountCommand } from "./archive-account.command";

@Injectable()
export class ArchiveAccountHandler {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ArchiveAccountCommand): Promise<void> {
    // Find the account
    const account = await this.accountRepository.findById(command.id);

    if (!account || account.workspaceId.value !== command.workspaceId) {
      throw new AccountNotFoundError(command.id);
    }

    // Archive the account
    const archivedAccount = account.archive();
    await this.accountRepository.update(archivedAccount);

    // Emit domain event
    this.eventEmitter.emit("account.archived", {
      accountId: command.id,
      workspaceId: command.workspaceId,
    });
  }
}
