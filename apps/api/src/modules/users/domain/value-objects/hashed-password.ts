import { z } from "zod";

const schema = z
  .string()
  .min(1, { message: "Hashed password cannot be empty" });

export class HashedPassword {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  toString(): string {
    return "[PROTECTED]";
  }
}
