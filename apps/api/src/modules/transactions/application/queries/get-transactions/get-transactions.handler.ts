import { Inject, Injectable } from "@nestjs/common";
import type { TransactionPrimitives } from "../../../domain/entities";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { GetTransactionsQuery } from "./get-transactions.query";

export type GetTransactionsResult = TransactionPrimitives[];

@Injectable()
export class GetTransactionsHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(query: GetTransactionsQuery): Promise<GetTransactionsResult> {
    const transactions = await this.transactionRepository.findByWorkspaceId(query.workspaceId, {
      accountId: query.accountId,
      categoryId: query.categoryId,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      includeArchived: query.includeArchived,
    });

    return transactions.map(transaction => transaction.toPrimitives());
  }
}
