"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sileo } from "sileo";
import { useState, type ReactNode } from "react";

import { isApiError, isValidationErrors } from "./errors";
import { getTranslationMessage } from "../i18n/locales/es";

/**
 * Get error message from an error object.
 * ApiError already contains a translated message from the API error code.
 */
function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
}

const queryCache = new QueryCache({
  onError: (error, query) => {
    // Skip validation errors - they're handled locally by forms
    if (isValidationErrors(error)) return;

    // Allow queries to opt-out of global error handling
    if (query.meta?.skipGlobalErrorHandler) return;

    sileo.error({
      title: "Error",
      description: getErrorMessage(error),
    });
  },
});

const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    // Skip validation errors - they're handled locally by forms
    if (isValidationErrors(error)) return;

    // Allow mutations to opt-out of global error handling
    if (mutation.meta?.skipGlobalErrorHandler) return;

    sileo.error({
      title: "Error",
      description: getErrorMessage(error),
    });
  },
  onSuccess: (_data, _variables, _context, mutation) => {
    const i18nToastKey = mutation.meta?.i18nToastKey;
    if (typeof i18nToastKey !== "string") return;

    const key = `toast.mutation.${i18nToastKey}.success`;
    const message = getTranslationMessage(key);

    if (message) {
      sileo.success({ description: message });
    }
  },
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Retry once on failure
        retry: 1,
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
      },
    },
    mutationCache,
    queryCache,
  });
}

// Browser: create query client once
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: always make a new query client
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // Browser: reuse existing client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(getQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
