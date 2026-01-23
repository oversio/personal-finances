import { z } from "zod";

const VALID_PROVIDERS = ["local", "google"] as const;

const schema = z.enum(VALID_PROVIDERS, {
  message: `Auth provider must be one of: ${VALID_PROVIDERS.join(", ")}`,
});

export type AuthProviderType = (typeof VALID_PROVIDERS)[number];

export class AuthProvider {
  readonly value: AuthProviderType;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  isLocal(): boolean {
    return this.value === "local";
  }

  isGoogle(): boolean {
    return this.value === "google";
  }

  equals(other: AuthProvider): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
