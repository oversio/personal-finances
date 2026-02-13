import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { TransactionPrimitives } from "../../../domain/entities";
import { TransactionNotFoundError } from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { UpdateTransactionCommand } from "./update-transaction.command";

export type UpdateTransactionResult = TransactionPrimitives;

@Injectable()
export class UpdateTransactionHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateTransactionCommand): Promise<UpdateTransactionResult> {
    const transaction = await this.transactionRepository.findById(command.id);

    if (!transaction || transaction.workspaceId.value !== command.workspaceId) {
      throw new TransactionNotFoundError(command.id);
    }

    // Store old values for balance adjustment event
    const oldType = transaction.type.value;
    const oldAccountId = transaction.accountId.value;
    const oldToAccountId = transaction.toAccountId?.value;
    const oldAmount = transaction.amount.value;

    // Update transaction (entity validates business rules)
    const updatedTransaction = transaction.update({
      type: command.type,
      accountId: command.accountId,
      toAccountId: command.toAccountId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      amount: command.amount,
      notes: command.notes,
      date: command.date,
    });

    const savedTransaction = await this.transactionRepository.update(updatedTransaction);

    // Emit domain event for balance updates
    this.eventEmitter.emit("transaction.updated", {
      transactionId: savedTransaction.id!.value,
      workspaceId: command.workspaceId,
      // Old values (to reverse)
      oldType,
      oldAccountId,
      oldToAccountId,
      oldAmount,
      // New values (to apply)
      newType: savedTransaction.type.value,
      newAccountId: savedTransaction.accountId.value,
      newToAccountId: savedTransaction.toAccountId?.value,
      newAmount: savedTransaction.amount.value,
    });

    return savedTransaction.toPrimitives();
  }
}
