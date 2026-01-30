import type { ZodType } from "zod";

import { apiClient } from "@/_commons/utils/api-client";

import { parseApiError } from "./errors";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface FetcherOptions<T> {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, unknown>;
  schema?: ZodType<T>;
}

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
export async function fetcher<T>(url: string, options: FetcherOptions<T> = {}): Promise<T> {
  const { method = "GET", body, params, schema } = options;

  try {
    const response = await apiClient.request({
      url,
      method,
      data: body,
      params,
    });

    // Parse with Zod if schema provided
    if (schema) {
      return schema.parse(response.data);
    }

    return response.data as T;
  } catch (error) {
    // Transform to ValidationErrors or ApiError and throw
    parseApiError(error);
  }
}
