import { Inject, Injectable } from "@nestjs/common";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RecurringTransactionNotFoundError } from "../../../domain/exceptions";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { GetRecurringTransactionQuery } from "./get-recurring-transaction.query";

export type GetRecurringTransactionResult = RecurringTransactionPrimitives;

@Injectable()
export class GetRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(query: GetRecurringTransactionQuery): Promise<GetRecurringTransactionResult> {
    const recurringTransaction = await this.repository.findById(query.id);

    if (!recurringTransaction || recurringTransaction.workspaceId.value !== query.workspaceId) {
      throw new RecurringTransactionNotFoundError(query.id);
    }

    return recurringTransaction.toPrimitives();
  }
}
