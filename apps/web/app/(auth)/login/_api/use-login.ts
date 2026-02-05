import { useMutation } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/(auth)/_api/_support/auth-query-keys";

import { login } from "./login";

export function useLogin() {
  return useMutation({
    mutationKey: [AUTH_QUERY_KEYS.login],
    mutationFn: login,
  });
}
