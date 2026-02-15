import { RecurringTransaction } from "../../domain/entities";

export const RECURRING_TRANSACTION_REPOSITORY = Symbol("RECURRING_TRANSACTION_REPOSITORY");

export interface RecurringTransactionFilters {
  type?: string;
  categoryId?: string;
  accountId?: string;
  isActive?: boolean;
  includeArchived?: boolean;
}

export interface RecurringTransactionRepository {
  save(recurringTransaction: RecurringTransaction): Promise<RecurringTransaction>;
  findById(id: string): Promise<RecurringTransaction | null>;
  findByWorkspaceId(
    workspaceId: string,
    filters?: RecurringTransactionFilters,
  ): Promise<RecurringTransaction[]>;
  findDue(workspaceId: string, asOfDate: Date): Promise<RecurringTransaction[]>;
  update(recurringTransaction: RecurringTransaction): Promise<RecurringTransaction>;
  delete(id: string): Promise<void>;
}
