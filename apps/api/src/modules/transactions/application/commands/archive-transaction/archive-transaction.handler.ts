import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TransactionNotFoundError } from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { ArchiveTransactionCommand } from "./archive-transaction.command";

@Injectable()
export class ArchiveTransactionHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ArchiveTransactionCommand): Promise<void> {
    const transaction = await this.transactionRepository.findById(command.id);

    if (!transaction || transaction.workspaceId.value !== command.workspaceId) {
      throw new TransactionNotFoundError(command.id);
    }

    // Already archived, nothing to do
    if (transaction.isArchived) {
      return;
    }

    const archivedTransaction = transaction.archive();
    await this.transactionRepository.update(archivedTransaction);

    // Emit domain event for balance reversal
    this.eventEmitter.emit("transaction.archived", {
      transactionId: transaction.id!.value,
      workspaceId: command.workspaceId,
      type: transaction.type.value,
      accountId: transaction.accountId.value,
      toAccountId: transaction.toAccountId?.value,
      amount: transaction.amount.value,
    });
  }
}
