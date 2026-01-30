"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { isValidationErrors } from "./errors";

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
      mutations: {
        onError: error => {
          // Skip validation errors - they're handled locally by forms
          if (isValidationErrors(error)) return;

          // Handle all other errors globally
          // TODO: Add toast notification here when toast library is added
          // toast.error(error instanceof ApiError ? error.message : "An error occurred");
          console.error("API Error:", error);
        },
      },
    },
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
