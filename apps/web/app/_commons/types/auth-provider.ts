export const AUTH_PROVIDER = {
  local: "local",
  google: "google",
  apple: "apple",
  github: "github",
} as const;

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];
