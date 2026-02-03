import { z } from "zod";

import { User } from "./user";

// Re-export from auth-provider.ts for backward compatibility
export { AUTH_PROVIDER, type AuthProvider } from "./auth-provider";

// Zod Schemas
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
});

export const AuthResponseSchema = z.object({
  user: User,
  tokens: AuthTokensSchema,
});

// Types (inferred from Zod)
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Input types for API calls
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}
