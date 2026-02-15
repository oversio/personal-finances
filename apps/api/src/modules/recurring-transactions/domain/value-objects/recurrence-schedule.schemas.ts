import { z } from "zod";

/**
 * Shared Zod schemas for recurrence schedule validation.
 * These schemas are used across domain value objects and DTOs to ensure consistency.
 */

export const intervalSchema = z
  .number()
  .int({ error: "Interval must be a whole number" })
  .min(1, { error: "Interval must be at least 1" })
  .max(365, { error: "Interval must be at most 365" });

export const dayOfWeekSchema = z
  .number()
  .int()
  .min(0, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
  .max(6, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" });

export const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, { error: "Day of month must be between 1 and 31" })
  .max(31, { error: "Day of month must be between 1 and 31" });

export const monthOfYearSchema = z
  .number()
  .int()
  .min(1, { error: "Month must be between 1 (January) and 12 (December)" })
  .max(12, { error: "Month must be between 1 (January) and 12 (December)" });
