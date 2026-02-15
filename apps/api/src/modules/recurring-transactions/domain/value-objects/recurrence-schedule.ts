import { Frequency, type FrequencyValue } from "./frequency";
import {
  dayOfMonthSchema,
  dayOfWeekSchema,
  intervalSchema,
  monthOfYearSchema,
} from "./recurrence-schedule.schemas";

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
