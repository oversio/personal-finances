import z from "zod";
import { parseDateTime } from "../utils/date-time";

export const ID = z.string({ message: "ID is required" });
export type ID = z.infer<typeof ID>;

export const DateTime = z.string().transform((value, ctx) => {
  const dateTime = parseDateTime(value);
  if (!dateTime)
    ctx.addIssue({
      code: "custom",
      message: `${value} is not a valid DateTime`,
    });
  return dateTime ?? z.NEVER;
});
export type DateTime = z.infer<typeof DateTime>;
export type ApiDateTime = z.input<typeof DateTime>;

export const DateTimeInput = z.date().transform(d => d.toISOString());
export type DateTimeInput = z.input<typeof DateTimeInput>;
