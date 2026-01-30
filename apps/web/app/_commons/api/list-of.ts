import z from "zod";

export const listOf = <
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
>(
  item: z.ZodType<Out, In, Int>,
) => z.array(item);
