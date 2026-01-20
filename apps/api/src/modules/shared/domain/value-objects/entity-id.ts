import { z } from "zod";

const schema = z.string().min(1, { message: "Entity ID cannot be empty" });

export class EntityId {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
