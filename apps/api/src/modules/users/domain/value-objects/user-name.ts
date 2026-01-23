import { z } from "zod";

const schema = z
  .string()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(100, { message: "Name must be at most 100 characters" })
  .trim();

export class UserName {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
