import { z } from "zod";

const schema = z
  .string()
  .min(1, { error: "Category name is required" })
  .max(50, { error: "Category name must be less than 50 characters" });

export class CategoryName {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }
}
