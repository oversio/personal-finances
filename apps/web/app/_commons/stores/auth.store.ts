import { create } from "zustand";
import type { AuthTokens } from "@/_commons/types/auth";
import type { User } from "@/_commons/types/user";
import { clearAuthCookies, getAuthTokensFromCookies } from "@/_commons/utils/cookies";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (isLoading: boolean) => void;
  initializeFromCookies: () => boolean;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(set => ({
  ...initialState,

  setAuth: (user, tokens) =>
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    }),

  setUser: user =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  setTokens: tokens =>
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }),

  setLoading: isLoading => set({ isLoading }),

  initializeFromCookies: () => {
    const tokens = getAuthTokensFromCookies();

    if (tokens.accessToken && tokens.refreshToken) {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isInitialized: true,
      });
      return true;
    }

    set({ isInitialized: true });
    return false;
  },

  logout: () => {
    clearAuthCookies();
    set({ ...initialState, isInitialized: true });
  },
}));

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectIsInitialized = (state: AuthStore) => state.isInitialized;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
export const selectRefreshToken = (state: AuthStore) => state.refreshToken;
