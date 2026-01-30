import z from "zod";
import { listOf } from "./list-of";

export const ApiGetManyResponse = z.object({
  data: z.array(z.any()),
});

export function apiManyResponseTransformer<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
>(itemType: z.ZodType<Out, In, Int>) {
  return ApiGetManyResponse.transform(({ data }) => ({
    data: listOf(itemType).parse(data),
  }));
}

export type GetManyResponse<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> = z.infer<ReturnType<typeof apiManyResponseTransformer<Out, In, Int>>>;
