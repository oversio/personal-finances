"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

interface HeroUIProviderWrapperProps {
  children: ReactNode;
}

export function HeroUIProviderWrapper({
  children,
}: HeroUIProviderWrapperProps) {
  const router = useRouter();

  return <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>;
}
