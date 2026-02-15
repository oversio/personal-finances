import { Inject, Injectable } from "@nestjs/common";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { GetRecurringTransactionsQuery } from "./get-recurring-transactions.query";

export type GetRecurringTransactionsResult = RecurringTransactionPrimitives[];

@Injectable()
export class GetRecurringTransactionsHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(query: GetRecurringTransactionsQuery): Promise<GetRecurringTransactionsResult> {
    const recurringTransactions = await this.repository.findByWorkspaceId(query.workspaceId, {
      type: query.type,
      categoryId: query.categoryId,
      accountId: query.accountId,
      isActive: query.isActive,
      includeArchived: query.includeArchived,
    });

    return recurringTransactions.map(rt => rt.toPrimitives());
  }
}
