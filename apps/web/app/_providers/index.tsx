"use client";

import type { ReactNode } from "react";

import { QueryProvider } from "@/_commons/api";

import { AuthProvider } from "./auth-provider";
import { HeroUIProviderWrapper } from "./heroui-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <HeroUIProviderWrapper>
        <AuthProvider>{children}</AuthProvider>
      </HeroUIProviderWrapper>
    </QueryProvider>
  );
}
