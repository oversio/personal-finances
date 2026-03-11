"use client";

import { useMutation } from "@tanstack/react-query";
import { TRANSACTION_QUERY_KEYS } from "../_support/transaction-query-keys";
import { scanInvoice } from "./scan-invoice";

export function useScanInvoice() {
  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.scanInvoice],
    mutationFn: scanInvoice,
  });
}
