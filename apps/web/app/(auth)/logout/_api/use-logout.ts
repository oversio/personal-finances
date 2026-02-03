import { useMutation } from "@tanstack/react-query";
import { logout } from "./logout";
import { AuthQueryKeys } from "@/(auth)/_api/_support/auth-query-keys";

export function useLogout() {
  return useMutation({
    mutationKey: [AuthQueryKeys.logout],
    mutationFn: logout,
  });
}
