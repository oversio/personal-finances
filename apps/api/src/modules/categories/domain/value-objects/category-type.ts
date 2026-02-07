import { z } from "zod";

const CATEGORY_TYPES = ["income", "expense"] as const;

const schema = z.enum(CATEGORY_TYPES, {
  message: "Invalid category type",
});

export type CategoryTypeValue = (typeof CATEGORY_TYPES)[number];

export class CategoryType {
  readonly value: CategoryTypeValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  static values(): readonly CategoryTypeValue[] {
    return CATEGORY_TYPES;
  }
}
