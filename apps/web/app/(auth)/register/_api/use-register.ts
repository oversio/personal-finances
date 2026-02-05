import { useMutation } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/(auth)/_api/_support/auth-query-keys";

import { register } from "./register";

export function useRegister() {
  return useMutation({
    mutationKey: [AUTH_QUERY_KEYS.register],
    mutationFn: register,
  });
}
