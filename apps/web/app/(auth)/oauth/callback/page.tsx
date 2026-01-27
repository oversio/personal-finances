"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { useAuthStore } from "@/_commons/stores/auth.store";
import { getMeApi } from "@/_commons/utils/auth-api";
import { getAuthTokensFromCookies } from "@/_commons/utils/cookies";

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get tokens from cookies (set by API)
        const tokens = getAuthTokensFromCookies();

        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error("No tokens found");
        }

        // Fetch user data
        const user = await getMeApi();

        // Store in Zustand
        setAuth(user, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        // Redirect to intended destination
        const redirectTo =
          sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
        sessionStorage.removeItem("redirectAfterAuth");
        router.push(redirectTo);
      } catch {
        router.push("/login?error=oauth_failed");
      }
    }

    handleCallback();
  }, [router, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-default-500">Completing sign in...</p>
    </div>
  );
}
