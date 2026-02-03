import { fetcher } from "@/_commons/api";
import { AuthResponse } from "../../_api/auth.types";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
export async function register(credentials: RegisterInput) {
  return fetcher("/auth/register", {
    method: "POST",
    body: credentials,
    schema: AuthResponse,
  });
}
