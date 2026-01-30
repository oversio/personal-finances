import { z } from "zod";
import { createZodDto } from "nestjs-zod";

/**
 * Pagination query parameters schema.
 * Used for list endpoints that support pagination.
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

/**
 * Pagination metadata for responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Helper function to create a paginated response.
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  query: PaginationQuery,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Helper function to calculate MongoDB skip value from pagination query.
 */
export function getSkipValue(query: PaginationQuery): number {
  return (query.page - 1) * query.limit;
}

/**
 * Helper function to get MongoDB sort object from pagination query.
 */
export function getSortObject(query: PaginationQuery): Record<string, 1 | -1> {
  return { [query.sortBy]: query.sortOrder === "asc" ? 1 : -1 };
}
