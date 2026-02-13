import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

const schema = z.enum(TRANSACTION_TYPES, {
  error: "Invalid transaction type. Must be income, expense, or transfer",
});

export type TransactionTypeValue = (typeof TRANSACTION_TYPES)[number];

export class TransactionType {
  readonly value: TransactionTypeValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  isIncome(): boolean {
    return this.value === "income";
  }

  isExpense(): boolean {
    return this.value === "expense";
  }

  isTransfer(): boolean {
    return this.value === "transfer";
  }

  /**
   * Returns true if this transaction type requires a category
   * (income and expense require categories, transfers do not)
   */
  requiresCategory(): boolean {
    return this.value === "income" || this.value === "expense";
  }

  /**
   * Returns true if this transaction type requires a destination account
   * (only transfers require a toAccountId)
   */
  requiresDestinationAccount(): boolean {
    return this.value === "transfer";
  }

  static values(): readonly TransactionTypeValue[] {
    return TRANSACTION_TYPES;
  }

  equals(other: TransactionType): boolean {
    return this.value === other.value;
  }
}
