import { z } from "zod";

const schema = z.number().finite({ error: "Amount must be a finite number" });

export class Money {
  readonly value: number;

  constructor(value: number) {
    this.value = schema.parse(value);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  subtract(other: Money): Money {
    return new Money(this.value - other.value);
  }

  isNegative(): boolean {
    return this.value < 0;
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  equals(other: Money): boolean {
    return this.value === other.value;
  }
}
