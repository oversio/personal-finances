import { z } from "zod";

const schema = z
  .string()
  .min(1, { error: "Account name is required" })
  .max(100, { error: "Account name must be less than 100 characters" });

export class AccountName {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }
}
