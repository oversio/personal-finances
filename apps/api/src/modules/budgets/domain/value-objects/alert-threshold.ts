import { z } from "zod";

const schema = z
  .number()
  .min(1, { error: "Alert threshold must be at least 1%" })
  .max(100, { error: "Alert threshold cannot exceed 100%" })
  .finite({ error: "Alert threshold must be a finite number" });

export class AlertThreshold {
  readonly value: number;

  constructor(value: number) {
    this.value = schema.parse(value);
  }

  static default(): AlertThreshold {
    return new AlertThreshold(80);
  }

  isTriggered(percentage: number): boolean {
    return percentage >= this.value;
  }
}
