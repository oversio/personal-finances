import { z } from "zod";

const schema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

export class Password {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  toString(): string {
    return "[PROTECTED]";
  }
}
