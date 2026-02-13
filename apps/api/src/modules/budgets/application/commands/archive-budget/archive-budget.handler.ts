import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BudgetNotFoundError } from "../../../domain/exceptions";
import { BUDGET_REPOSITORY, type BudgetRepository } from "../../ports";
import { ArchiveBudgetCommand } from "./archive-budget.command";

@Injectable()
export class ArchiveBudgetHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: BudgetRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ArchiveBudgetCommand): Promise<void> {
    const budget = await this.budgetRepository.findById(command.id);

    if (!budget || budget.workspaceId.value !== command.workspaceId) {
      throw new BudgetNotFoundError(command.id);
    }

    const archivedBudget = budget.archive();
    await this.budgetRepository.update(archivedBudget);

    this.eventEmitter.emit("budget.archived", {
      budgetId: command.id,
      workspaceId: command.workspaceId,
    });
  }
}
