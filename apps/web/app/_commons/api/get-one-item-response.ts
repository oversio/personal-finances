import z from "zod";

export const ApiGetOneItemResponse = z.object({
  data: z.any(),
});

export function apiOneItemResponseTransformer<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
>(itemType: z.ZodType<Out, In, Int>) {
  return ApiGetOneItemResponse.transform(({ data }) => ({
    data: itemType.parse(data),
  }));
}

export type GetOneItemResponse<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> = z.infer<ReturnType<typeof apiOneItemResponseTransformer<Out, In, Int>>>;
