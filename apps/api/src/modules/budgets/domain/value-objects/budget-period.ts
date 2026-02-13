import { z } from "zod";

const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

const schema = z.enum(BUDGET_PERIODS, { error: "Invalid budget period" });

export type BudgetPeriodValue = (typeof BUDGET_PERIODS)[number];

export class BudgetPeriod {
  readonly value: BudgetPeriodValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  static values(): readonly BudgetPeriodValue[] {
    return BUDGET_PERIODS;
  }

  /**
   * Calculate the current period date range based on period type and start date.
   * The period always aligns with the startDate's characteristics:
   * - Weekly: Uses startDate's day of week
   * - Monthly: Uses startDate's day of month
   * - Yearly: Uses startDate's month and day
   */
  getCurrentPeriodRange(startDate: Date): { start: Date; end: Date } {
    const now = new Date();

    switch (this.value) {
      case "weekly":
        return this.getWeeklyPeriod(startDate, now);
      case "monthly":
        return this.getMonthlyPeriod(startDate, now);
      case "yearly":
        return this.getYearlyPeriod(startDate, now);
    }
  }

  private getWeeklyPeriod(startDate: Date, now: Date): { start: Date; end: Date } {
    const dayOfWeek = startDate.getDay();

    // Find the most recent occurrence of that day of week
    const daysBack = (now.getDay() - dayOfWeek + 7) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getMonthlyPeriod(startDate: Date, now: Date): { start: Date; end: Date } {
    const dayOfMonth = startDate.getDate();

    // Start from the budget day of current month
    const start = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 0, 0, 0, 0);

    // If that day hasn't occurred yet this month, go back one period
    if (start > now) {
      start.setMonth(start.getMonth() - 1);
    }

    // End is one month later minus one day
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private getYearlyPeriod(startDate: Date, now: Date): { start: Date; end: Date } {
    const month = startDate.getMonth();
    const day = startDate.getDate();

    // Start from the budget month/day of current year
    const start = new Date(now.getFullYear(), month, day, 0, 0, 0, 0);

    // If that date hasn't occurred yet this year, go back one period
    if (start > now) {
      start.setFullYear(start.getFullYear() - 1);
    }

    // End is one year later minus one day
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }
}
