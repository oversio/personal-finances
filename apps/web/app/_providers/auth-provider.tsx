"use client";

import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "@/_commons/stores/auth.store";
import { getAuthUser } from "@/(auth)/_api/auth-user/get-auth-user";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeFromCookies = useAuthStore(state => state.initializeFromCookies);
  const setUser = useAuthStore(state => state.setUser);
  const logout = useAuthStore(state => state.logout);
  const isInitialized = useAuthStore(state => state.isInitialized);

  useEffect(() => {
    async function initAuth() {
      // Try to get tokens from cookies
      const hasTokens = initializeFromCookies();

      if (hasTokens) {
        try {
          // Fetch user data with the token
          const user = await getAuthUser();
          setUser(user);
        } catch {
          // Token invalid or expired, clear auth
          logout();
        }
      }
    }

    if (!isInitialized) {
      initAuth();
    }
  }, [initializeFromCookies, setUser, logout, isInitialized]);

  return <>{children}</>;
}
