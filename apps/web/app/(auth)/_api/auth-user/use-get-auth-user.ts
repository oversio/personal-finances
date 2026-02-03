import { useQuery } from "@tanstack/react-query";
import { AuthQueryKeys } from "../_support/auth-query-keys";
import { getAuthUser } from "./get-auth-user";

export function useGetAuthUser() {
  return useQuery({
    queryKey: [AuthQueryKeys.authUser],
    queryFn: getAuthUser,
  });
}
