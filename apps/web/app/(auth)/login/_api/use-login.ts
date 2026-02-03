import { useMutation } from "@tanstack/react-query";
import { login } from "./login";
import { AuthQueryKeys } from "@/(auth)/_api/_support/auth-query-keys";

export function useLogin() {
  return useMutation({
    mutationKey: [AuthQueryKeys.login],
    mutationFn: login,
  });
}
