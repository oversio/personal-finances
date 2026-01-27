"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { HeroUIProviderWrapper } from "./heroui-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProviderWrapper>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProviderWrapper>
  );
}
