import { z } from "zod";

const MAX_AMOUNT = 999_999_999_999.99; // ~1 trillion

const schema = z
  .number()
  .positive({ error: "Amount must be a positive number" })
  .finite({ error: "Amount must be a finite number" })
  .max(MAX_AMOUNT, { error: `Amount cannot exceed ${MAX_AMOUNT}` });

export class TransactionAmount {
  readonly value: number;

  constructor(value: number) {
    this.value = schema.parse(value);
  }

  equals(other: TransactionAmount): boolean {
    return this.value === other.value;
  }

  /**
   * Returns the negative value (for expense/transfer source deductions)
   */
  negate(): number {
    return -this.value;
  }
}
