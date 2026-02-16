import { AuthResponse } from "@/(auth)/_api/auth.types";
import { fetcher } from "@/_commons/api";

export interface LoginInput {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export async function login(credentials: LoginInput) {
  return fetcher("/auth/login", {
    method: "POST",
    body: credentials,
    schema: AuthResponse,
  });
}
