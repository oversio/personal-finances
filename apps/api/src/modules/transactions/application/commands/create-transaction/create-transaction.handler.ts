import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Transaction, type TransactionPrimitives } from "../../../domain/entities";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { CreateTransactionCommand } from "./create-transaction.command";

export type CreateTransactionResult = TransactionPrimitives;

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<CreateTransactionResult> {
    // Create the transaction (entity validates business rules)
    const transaction = Transaction.create({
      workspaceId: command.workspaceId,
      type: command.type,
      accountId: command.accountId,
      toAccountId: command.toAccountId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      amount: command.amount,
      currency: command.currency,
      notes: command.notes,
      date: command.date,
      createdBy: command.createdBy,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Emit domain event for balance updates
    this.eventEmitter.emit("transaction.created", {
      transactionId: savedTransaction.id!.value,
      workspaceId: command.workspaceId,
      type: savedTransaction.type.value,
      accountId: savedTransaction.accountId.value,
      toAccountId: savedTransaction.toAccountId?.value,
      amount: savedTransaction.amount.value,
    });

    return savedTransaction.toPrimitives();
  }
}
