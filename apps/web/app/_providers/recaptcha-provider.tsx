"use client";

import type { ReactNode } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface RecaptchaProviderProps {
  children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    return <>{children}</>;
  }

  return <GoogleReCaptchaProvider reCaptchaKey={siteKey}>{children}</GoogleReCaptchaProvider>;
}
