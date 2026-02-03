import { apiClient } from "@/_commons/utils/api-client";

import { parseApiError } from "./errors";
import z, { output, ZodType } from "zod";

interface FetcherGetOrDeleteOptions<
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> {
  method: "GET" | "DELETE";
  schema?: ZodType<Out, In, Int>;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

interface FetcherCreateOrUpdateOptions<
  TPayload,
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> {
  method: "POST" | "PUT" | "PATCH";
  body?: TPayload;
  params?: Record<string, unknown>;
  schema?: ZodType<Out, In, Int>;
}

type FetcherOptions<
  TPayload,
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
> = FetcherGetOrDeleteOptions<Out, In, Int> | FetcherCreateOrUpdateOptions<TPayload, Out, In, Int>;

/**
 * Core fetcher function for API requests.
 *
 * - Parses successful responses with Zod schema (if provided)
 * - Throws ValidationErrors for 422 responses
 * - Throws ApiError for other error responses
 *
 * @example
 * // GET request with schema parsing
 * const accounts = await fetcher("/accounts", {
 *   schema: apiPaginationResponseTransformer(AccountSchema),
 * });
 *
 * @example
 * // POST request
 * const newAccount = await fetcher("/accounts", {
 *   method: "POST",
 *   body: { name: "Savings" },
 *   schema: apiOneItemResponseTransformer(AccountSchema),
 * });
 */
export async function fetcher<
  TPayload,
  Out,
  In,
  Int extends z.core.$ZodTypeInternals<Out, In> = z.core.$ZodTypeInternals<Out, In>,
>(
  url: string,
  options: FetcherOptions<TPayload, Out, In, Int> = { method: "GET" } as FetcherOptions<
    TPayload,
    Out,
    In,
    Int
  >,
): Promise<output<ZodType<Out, In, Int>>> {
  const { method, params, schema } = options;
  const axiosRequest: Parameters<typeof apiClient.request>[0] = {
    url,
    method,
    params,
  };

  if (options.method === "GET") {
    axiosRequest.signal = options.signal;
  }

  if (options.method === "POST" || options.method === "PUT" || options.method === "PATCH") {
    axiosRequest.data = options.body;
  }

  try {
    const response = await apiClient.request(axiosRequest);

    if (schema) return schema.parse(response.data);

    return response.data;
  } catch (error) {
    // Transform to ValidationErrors or ApiError and throw
    parseApiError(error);
  }
}
