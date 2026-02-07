import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Account } from "../../../domain/entities";
import { AccountAlreadyExistsError } from "../../../domain/exceptions";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "../../ports";
import { CreateAccountCommand } from "./create-account.command";

export type CreateAccountResult = ReturnType<Account["toPrimitives"]>;

@Injectable()
export class CreateAccountHandler {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateAccountCommand): Promise<CreateAccountResult> {
    // Check for duplicate name in workspace
    const existing = await this.accountRepository.findByNameAndWorkspace(
      command.name,
      command.workspaceId,
    );

    if (existing) {
      throw new AccountAlreadyExistsError(command.name);
    }

    // Create the account
    const account = Account.create({
      workspaceId: command.workspaceId,
      name: command.name,
      type: command.type,
      currency: command.currency,
      initialBalance: command.initialBalance,
      color: command.color,
      icon: command.icon,
    });

    const savedAccount = await this.accountRepository.save(account);

    // Emit domain event
    this.eventEmitter.emit("account.created", {
      accountId: savedAccount.id!.value,
      workspaceId: command.workspaceId,
      name: command.name,
      type: command.type,
    });

    return savedAccount.toPrimitives();
  }
}
