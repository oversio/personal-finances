export const AUTH_PROVIDER = {
  local: "local",
  google: "google",
  apple: "apple",
  github: "github",
} as const;

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

// Array format for Zod enum (derived from AUTH_PROVIDER)
export const AUTH_PROVIDER_VALUES = Object.values(AUTH_PROVIDER) as [
  AuthProvider,
  ...AuthProvider[],
];
