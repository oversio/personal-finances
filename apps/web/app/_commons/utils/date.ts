import { parseDate, type CalendarDate } from "@internationalized/date";

/**
 * Converts a JavaScript Date to CalendarDate using local timezone.
 * Use this for DatePicker components to avoid UTC timezone shifts.
 */
export function dateToCalendarDate(date: Date): CalendarDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return parseDate(`${year}-${month}-${day}`);
}

/**
 * Converts a JavaScript Date to a YYYY-MM-DD string using local timezone.
 * Use this for grouping/comparing dates without UTC timezone shifts.
 */
export function dateToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
