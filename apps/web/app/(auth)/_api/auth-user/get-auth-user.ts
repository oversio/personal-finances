import { fetcher } from "@/_commons/api";
import { User } from "@/_commons/types/user";

export async function getAuthUser() {
  return fetcher("/auth/me", {
    method: "GET",
    schema: User,
  });
}
