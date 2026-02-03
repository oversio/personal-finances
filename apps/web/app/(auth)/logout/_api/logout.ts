import { fetcher } from "@/_commons/api";
import { IgnoreResponse } from "@/_commons/api/ignore-response-schema";

export async function logout(refreshToken: string): Promise<void> {
  return fetcher("/auth/logout", {
    method: "POST",
    body: { refreshToken },
    schema: IgnoreResponse,
  });
}
