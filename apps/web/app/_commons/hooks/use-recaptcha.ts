"use client";

import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const getToken = useCallback(
    async (action: string): Promise<string | undefined> => {
      if (!executeRecaptcha) {
        return undefined;
      }
      return executeRecaptcha(action);
    },
    [executeRecaptcha],
  );

  return { getToken, isReady: !!executeRecaptcha };
}
