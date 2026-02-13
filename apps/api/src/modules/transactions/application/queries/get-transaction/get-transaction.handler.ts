import { Inject, Injectable } from "@nestjs/common";
import type { TransactionPrimitives } from "../../../domain/entities";
import { TransactionNotFoundError } from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { GetTransactionQuery } from "./get-transaction.query";

export type GetTransactionResult = TransactionPrimitives;

@Injectable()
export class GetTransactionHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(query: GetTransactionQuery): Promise<GetTransactionResult> {
    const transaction = await this.transactionRepository.findById(query.id);

    if (!transaction || transaction.workspaceId.value !== query.workspaceId) {
      throw new TransactionNotFoundError(query.id);
    }

    return transaction.toPrimitives();
  }
}
