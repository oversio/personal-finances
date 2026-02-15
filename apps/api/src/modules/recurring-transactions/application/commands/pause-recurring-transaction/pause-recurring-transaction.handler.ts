import { Inject, Injectable } from "@nestjs/common";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RecurringTransactionNotFoundError } from "../../../domain/exceptions";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { PauseRecurringTransactionCommand } from "./pause-recurring-transaction.command";

export type PauseRecurringTransactionResult = RecurringTransactionPrimitives;

@Injectable()
export class PauseRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(
    command: PauseRecurringTransactionCommand,
  ): Promise<PauseRecurringTransactionResult> {
    const existing = await this.repository.findById(command.id);

    if (!existing || existing.workspaceId.value !== command.workspaceId) {
      throw new RecurringTransactionNotFoundError(command.id);
    }

    const paused = existing.pause();
    const saved = await this.repository.update(paused);
    return saved.toPrimitives();
  }
}
