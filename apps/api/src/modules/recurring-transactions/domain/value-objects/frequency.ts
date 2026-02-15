import { z } from "zod";

export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

const schema = z.enum(FREQUENCIES, {
  error: "Invalid frequency. Must be daily, weekly, monthly, or yearly",
});

export type FrequencyValue = (typeof FREQUENCIES)[number];

export class Frequency {
  readonly value: FrequencyValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  isDaily(): boolean {
    return this.value === "daily";
  }

  isWeekly(): boolean {
    return this.value === "weekly";
  }

  isMonthly(): boolean {
    return this.value === "monthly";
  }

  isYearly(): boolean {
    return this.value === "yearly";
  }

  requiresDayOfWeek(): boolean {
    return this.value === "weekly";
  }

  requiresDayOfMonth(): boolean {
    return this.value === "monthly" || this.value === "yearly";
  }

  requiresMonthOfYear(): boolean {
    return this.value === "yearly";
  }

  static values(): readonly FrequencyValue[] {
    return FREQUENCIES;
  }

  equals(other: Frequency): boolean {
    return this.value === other.value;
  }
}
