import z from "zod";
import { ApiGetManyResponse } from "./get-many-response";
import { listOf } from "./list-of";

export const ApiPaginationResponse = ApiGetManyResponse.extend({
  pagination: z.object({
    page: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export function apiPaginationResponseTransformer<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
>(itemType: z.ZodType<Out, In, Int>) {
  return ApiPaginationResponse.transform(({ data, pagination }) => ({
    data: listOf(itemType).parse(data),
    pagination,
  }));
}

export type PaginationResponse<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> = z.infer<ReturnType<typeof apiPaginationResponseTransformer<Out, In, Int>>>;
