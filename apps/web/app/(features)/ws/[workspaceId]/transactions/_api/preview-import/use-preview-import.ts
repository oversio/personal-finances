"use client";

import { useMutation } from "@tanstack/react-query";
import { TRANSACTION_QUERY_KEYS } from "../_support/transaction-query-keys";
import { previewImport } from "./preview-import";

export function usePreviewImport() {
  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.importPreview],
    mutationFn: previewImport,
  });
}
