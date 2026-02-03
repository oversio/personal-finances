import { useMutation } from "@tanstack/react-query";
import { register } from "./register";
import { AuthQueryKeys } from "@/(auth)/_api/_support/auth-query-keys";

export function useRegister() {
  return useMutation({
    mutationKey: [AuthQueryKeys.register],
    mutationFn: register,
  });
}
