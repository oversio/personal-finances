import { Transaction } from "../../domain/entities";

export const TRANSACTION_REPOSITORY = Symbol("TRANSACTION_REPOSITORY");

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
}

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByWorkspaceId(workspaceId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;

  /**
   * Sum expense transactions by category/subcategory within a date range.
   * Used for budget progress calculation.
   *
   * @param workspaceId - Workspace to query
   * @param categoryId - Category to sum expenses for
   * @param subcategoryId - If provided, only sum transactions with this subcategory
   * @param startDate - Start of date range (inclusive)
   * @param endDate - End of date range (inclusive)
   * @returns Total amount spent
   */
  sumByCategory(
    workspaceId: string,
    categoryId: string,
    subcategoryId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;
}
