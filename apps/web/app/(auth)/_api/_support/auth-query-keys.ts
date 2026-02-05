export const AUTH_QUERY_KEYS = {
  authUser: "auth-user",
  login: "login",
  register: "register",
  logout: "logout",
} as const;

export type AuthQueryKey = (typeof AUTH_QUERY_KEYS)[keyof typeof AUTH_QUERY_KEYS];
