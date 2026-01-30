import z from "zod";
import { AUTH_PROVIDER } from "./auth";
import { DateTime } from "./app";

export const ApiGetUser = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  picture: z.string().optional(),
  authProvider: z.enum(AUTH_PROVIDER),
  isEmailVerified: z.boolean(),
  createdAt: DateTime,
});
export type ApiGetUser = z.infer<typeof ApiGetUser>;

function getUserTransformer<T extends ApiGetUser>(data: T) {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    authProvider: data.authProvider,
    isEmailVerified: data.isEmailVerified,
    createdAt: data.createdAt,
  };
}

export const User = ApiGetUser.transform(getUserTransformer);
export type User = z.infer<typeof User>;
