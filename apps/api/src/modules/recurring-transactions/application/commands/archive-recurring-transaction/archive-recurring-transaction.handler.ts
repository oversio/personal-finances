import { Inject, Injectable } from "@nestjs/common";
import { RecurringTransactionNotFoundError } from "../../../domain/exceptions";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { ArchiveRecurringTransactionCommand } from "./archive-recurring-transaction.command";

@Injectable()
export class ArchiveRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(command: ArchiveRecurringTransactionCommand): Promise<void> {
    const existing = await this.repository.findById(command.id);

    if (!existing || existing.workspaceId.value !== command.workspaceId) {
      throw new RecurringTransactionNotFoundError(command.id);
    }

    const archived = existing.archive();
    await this.repository.update(archived);
  }
}
