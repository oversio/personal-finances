import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Account } from "../../../domain/entities";
import { AccountAlreadyExistsError, AccountNotFoundError } from "../../../domain/exceptions";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "../../ports";
import { UpdateAccountCommand } from "./update-account.command";

export type UpdateAccountResult = ReturnType<Account["toPrimitives"]>;

@Injectable()
export class UpdateAccountHandler {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateAccountCommand): Promise<UpdateAccountResult> {
    // Find the account
    const account = await this.accountRepository.findById(command.id);

    if (!account || account.workspaceId.value !== command.workspaceId) {
      throw new AccountNotFoundError(command.id);
    }

    // Check for duplicate name if name is being changed
    if (command.name && command.name !== account.name.value) {
      const existing = await this.accountRepository.findByNameAndWorkspace(
        command.name,
        command.workspaceId,
      );

      if (existing && existing.id?.value !== command.id) {
        throw new AccountAlreadyExistsError(command.name);
      }
    }

    // Update the account
    const updatedAccount = account.update({
      name: command.name,
      type: command.type,
      color: command.color,
      icon: command.icon,
    });

    const savedAccount = await this.accountRepository.update(updatedAccount);

    // Emit domain event
    this.eventEmitter.emit("account.updated", {
      accountId: savedAccount.id!.value,
      workspaceId: command.workspaceId,
    });

    return savedAccount.toPrimitives();
  }
}
