"use client";

import type { ReactNode } from "react";

import { HeroUIProviderWrapper } from "./heroui-provider";
import { LenisProvider } from "./lenis-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProviderWrapper>
      <LenisProvider>{children}</LenisProvider>
    </HeroUIProviderWrapper>
  );
}
