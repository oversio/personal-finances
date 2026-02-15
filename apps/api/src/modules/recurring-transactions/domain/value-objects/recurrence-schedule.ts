import { z } from "zod";
import { Frequency, type FrequencyValue } from "./frequency";

const intervalSchema = z
  .number()
  .int({ error: "Interval must be a whole number" })
  .min(1, { error: "Interval must be at least 1" })
  .max(365, { error: "Interval must be at most 365" });

const dayOfWeekSchema = z
  .number()
  .int()
  .min(0, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
  .max(6, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" });

const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, { error: "Day of month must be between 1 and 31" })
  .max(31, { error: "Day of month must be between 1 and 31" });

const monthOfYearSchema = z
  .number()
  .int()
  .min(1, { error: "Month must be between 1 (January) and 12 (December)" })
  .max(12, { error: "Month must be between 1 (January) and 12 (December)" });

export interface RecurrenceScheduleParams {
  frequency: string;
  interval: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface RecurrenceSchedulePrimitives {
  frequency: FrequencyValue;
  interval: number;
  dayOfWeek: number | undefined;
  dayOfMonth: number | undefined;
  monthOfYear: number | undefined;
}

export class RecurrenceSchedule {
  readonly frequency: Frequency;
  readonly interval: number;
  readonly dayOfWeek: number | undefined;
  readonly dayOfMonth: number | undefined;
  readonly monthOfYear: number | undefined;

  constructor(params: RecurrenceScheduleParams) {
    this.frequency = new Frequency(params.frequency);
    this.interval = intervalSchema.parse(params.interval);

    // Validate and set schedule fields based on frequency
    if (this.frequency.requiresDayOfWeek()) {
      if (params.dayOfWeek === undefined) {
        throw new Error("Weekly frequency requires dayOfWeek");
      }
      this.dayOfWeek = dayOfWeekSchema.parse(params.dayOfWeek);
    }

    if (this.frequency.requiresDayOfMonth()) {
      if (params.dayOfMonth === undefined) {
        throw new Error(
          `${this.frequency.value.charAt(0).toUpperCase() + this.frequency.value.slice(1)} frequency requires dayOfMonth`,
        );
      }
      this.dayOfMonth = dayOfMonthSchema.parse(params.dayOfMonth);
    }

    if (this.frequency.requiresMonthOfYear()) {
      if (params.monthOfYear === undefined) {
        throw new Error("Yearly frequency requires monthOfYear");
      }
      this.monthOfYear = monthOfYearSchema.parse(params.monthOfYear);
    }
  }

  /**
   * Calculate the next run date from a given date
   */
  calculateNextRunDate(fromDate: Date): Date {
    const next = new Date(fromDate);

    switch (this.frequency.value) {
      case "daily": {
        next.setDate(next.getDate() + this.interval);
        break;
      }

      case "weekly": {
        // Move to next occurrence of dayOfWeek
        next.setDate(next.getDate() + this.interval * 7);
        // Adjust to correct day of week if needed
        const currentDay = next.getDay();
        const targetDay = this.dayOfWeek!;
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        if (daysToAdd > 0) {
          next.setDate(next.getDate() + daysToAdd);
        }
        break;
      }

      case "monthly": {
        next.setMonth(next.getMonth() + this.interval);
        // Handle day of month (clamp to last day if needed)
        const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(this.dayOfMonth!, lastDayOfMonth));
        break;
      }

      case "yearly": {
        next.setFullYear(next.getFullYear() + this.interval);
        next.setMonth(this.monthOfYear! - 1); // monthOfYear is 1-indexed
        const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(this.dayOfMonth!, lastDay));
        break;
      }
    }

    return next;
  }

  toPrimitives(): RecurrenceSchedulePrimitives {
    return {
      frequency: this.frequency.value,
      interval: this.interval,
      dayOfWeek: this.dayOfWeek,
      dayOfMonth: this.dayOfMonth,
      monthOfYear: this.monthOfYear,
    };
  }
}
