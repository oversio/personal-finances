import { z } from "zod";

const schema = z.coerce.date({ error: "Invalid date format" }).refine(
  date => {
    // Allow dates up to end of current day (to handle timezone differences)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date < tomorrow;
  },
  { message: "Transaction date cannot be in the future" },
);

export class TransactionDate {
  readonly value: Date;

  constructor(value: Date | string) {
    this.value = schema.parse(value);
  }

  static now(): TransactionDate {
    return new TransactionDate(new Date());
  }

  equals(other: TransactionDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  /**
   * Returns ISO date string (YYYY-MM-DD)
   */
  toISODateString(): string {
    return this.value.toISOString().split("T")[0];
  }
}
