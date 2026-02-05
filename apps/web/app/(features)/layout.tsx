"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";

import { getAuthUser } from "@/(auth)/_api/auth-user/get-auth-user";
import {
  useAuthStore,
  selectIsInitialized,
  selectIsAuthenticated,
  selectUser,
  selectAccessToken,
} from "@/_commons/stores/auth.store";
import { useSidebarStore, selectIsCollapsed } from "@/_commons/stores/sidebar.store";
import { AppNavbar } from "./_components/app-navbar";
import { AppSidebar } from "./_components/app-sidebar";

interface FeaturesLayoutProps {
  children: React.ReactNode;
}

export default function FeaturesLayout({ children }: FeaturesLayoutProps) {
  const router = useRouter();

  const isInitialized = useAuthStore(selectIsInitialized);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const accessToken = useAuthStore(selectAccessToken);
  const initializeFromCookies = useAuthStore(state => state.initializeFromCookies);
  const setAuth = useAuthStore(state => state.setAuth);
  const logout = useAuthStore(state => state.logout);

  const isCollapsed = useSidebarStore(selectIsCollapsed);

  useEffect(() => {
    async function initializeAuth() {
      // Step 1: Initialize tokens from cookies if not done yet
      if (!isInitialized) {
        const hasTokens = initializeFromCookies();

        if (!hasTokens) {
          // No tokens in cookies, redirect to login
          router.replace("/login");
          return;
        }
      }
    }

    initializeAuth();
  }, [isInitialized, initializeFromCookies, router]);

  useEffect(() => {
    async function fetchUser() {
      // Step 2: Fetch user if we have tokens but no user
      if (isInitialized && accessToken && !user) {
        try {
          const fetchedUser = await getAuthUser();
          setAuth(fetchedUser, {
            accessToken: accessToken,
            refreshToken: useAuthStore.getState().refreshToken ?? "",
          });
        } catch {
          // Token is invalid, clear auth and redirect
          logout();
          router.replace("/login");
        }
      }
    }

    fetchUser();
  }, [isInitialized, accessToken, user, setAuth, logout, router]);

  // Show loading while initializing or fetching user
  if (!isInitialized || (accessToken && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Safety check: redirect if not authenticated after initialization
  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <AppSidebar />
      <main
        className={`
          pt-14 transition-all duration-200
          md:pl-64
          ${isCollapsed ? "md:pl-16" : "md:pl-64"}
        `}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
