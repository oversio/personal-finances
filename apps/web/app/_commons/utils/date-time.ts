export const parseDateTime = (s: string) => {
  const timestamp = new Date(s);
  return timestamp.toString() === "Invalid Date" ? null : timestamp;
};
export const stringifyDateTime = (d: Date) => d.toISOString();
