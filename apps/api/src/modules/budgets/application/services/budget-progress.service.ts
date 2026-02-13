import { Inject, Injectable } from "@nestjs/common";
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from "@/modules/transactions/application/ports";
import { Budget, type BudgetProgress } from "../../domain/entities";

@Injectable()
export class BudgetProgressService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async calculateProgress(budget: Budget): Promise<BudgetProgress> {
    const { start, end } = budget.getCurrentPeriodRange();

    const spent = await this.transactionRepository.sumByCategory(
      budget.workspaceId.value,
      budget.categoryId.value,
      budget.subcategoryId,
      start,
      end,
    );

    return budget.calculateProgress(spent);
  }
}
