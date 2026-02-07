// Core fetcher
export { fetcher } from "./fetcher";

// Response schemas and transformers
export {
  ApiGetManyResponse,
  apiManyResponseTransformer,
  type GetManyResponse,
} from "./get-many-response";
export {
  ApiGetOneItemResponse,
  apiOneItemResponseTransformer,
  type GetOneItemResponse,
} from "./get-one-item-response";
export {
  ApiPaginationResponse,
  apiPaginationResponseTransformer,
  type PaginationResponse,
} from "./get-pagination-response";
export { listOf } from "./list-of";
export { IgnoreResponse } from "./ignore-response-schema";

// Error handling
export {
  ValidationErrors,
  isValidationErrors,
  ApiError,
  isApiError,
  parseApiError,
  type MutationError,
} from "./errors";

// React Query
export { QueryProvider } from "./query-client-provider";

// Hooks
export { useServerFormValidationErrors } from "./hooks";
