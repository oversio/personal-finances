import { z } from "zod";

const MAX_BUDGET_AMOUNT = 999_999_999_999; // ~1 trillion

const schema = z
  .number()
  .positive({ error: "Budget amount must be positive" })
  .max(MAX_BUDGET_AMOUNT, { error: "Budget amount exceeds maximum limit" })
  .finite({ error: "Budget amount must be a finite number" });

export class BudgetAmount {
  readonly value: number;

  constructor(value: number) {
    this.value = schema.parse(value);
  }

  static max(): number {
    return MAX_BUDGET_AMOUNT;
  }
}
