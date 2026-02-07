import { z } from "zod";

const ACCOUNT_TYPES = ["checking", "savings", "credit_card", "cash", "investment"] as const;

const schema = z.enum(ACCOUNT_TYPES, {
  message: "Invalid account type",
});

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number];

export class AccountType {
  readonly value: AccountTypeValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  static values(): readonly AccountTypeValue[] {
    return ACCOUNT_TYPES;
  }
}
