import { User } from "@/_commons/types/user";
import z from "zod";

export const AuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
});

export type AuthTokens = z.infer<typeof AuthTokens>;

export const AuthResponse = z.object({
  user: User,
  tokens: AuthTokens,
});

export type AuthResponse = z.infer<typeof AuthResponse>;
