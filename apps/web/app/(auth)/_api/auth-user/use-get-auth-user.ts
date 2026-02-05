import { useQuery } from "@tanstack/react-query";

import { AUTH_QUERY_KEYS } from "@/(auth)/_api/_support/auth-query-keys";

import { getAuthUser } from "./get-auth-user";

export function useGetAuthUser() {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.authUser],
    queryFn: getAuthUser,
  });
}
