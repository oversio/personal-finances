import { Inject, Injectable } from "@nestjs/common";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RecurringTransactionNotFoundError } from "../../../domain/exceptions";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { ResumeRecurringTransactionCommand } from "./resume-recurring-transaction.command";

export type ResumeRecurringTransactionResult = RecurringTransactionPrimitives;

@Injectable()
export class ResumeRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(
    command: ResumeRecurringTransactionCommand,
  ): Promise<ResumeRecurringTransactionResult> {
    const existing = await this.repository.findById(command.id);

    if (!existing || existing.workspaceId.value !== command.workspaceId) {
      throw new RecurringTransactionNotFoundError(command.id);
    }

    const resumed = existing.resume();
    const saved = await this.repository.update(resumed);
    return saved.toPrimitives();
  }
}
