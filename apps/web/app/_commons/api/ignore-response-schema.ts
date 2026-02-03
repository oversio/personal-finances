import z from "zod";

export const IgnoreResponse = z.any();
export type IgnoreResponse = z.infer<typeof IgnoreResponse>;
