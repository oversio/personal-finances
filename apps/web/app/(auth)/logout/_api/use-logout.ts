import { useMutation } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/(auth)/_api/_support/auth-query-keys";

import { logout } from "./logout";

export function useLogout() {
  return useMutation({
    mutationKey: [AUTH_QUERY_KEYS.logout],
    mutationFn: logout,
  });
}
