import { z } from "zod";

const schema = z.string().email({ message: "Invalid email format" });

export class Email {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value.toLowerCase().trim());
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
