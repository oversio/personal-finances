import { z } from "zod";

const schema = z
  .string()
  .min(1, { error: "Budget name is required" })
  .max(100, { error: "Budget name must be less than 100 characters" });

export class BudgetName {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }
}
