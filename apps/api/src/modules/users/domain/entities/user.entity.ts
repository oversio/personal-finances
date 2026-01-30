import { EntityId } from "@/modules/shared/domain/value-objects";
import { AuthProvider, Email, HashedPassword, UserName } from "../value-objects";
import type { AuthProviderType } from "../value-objects";

export class User {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly email: Email,
    public readonly name: UserName,
    public readonly passwordHash: HashedPassword | undefined,
    public readonly provider: AuthProvider,
    public readonly providerId: string | undefined,
    public readonly isEmailVerified: boolean,
    public readonly picture: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string | undefined,
    email: string,
    name: string,
    passwordHash: string | undefined,
    provider: AuthProviderType = "local",
    providerId?: string,
    isEmailVerified: boolean = false,
    picture?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): User {
    const now = new Date();
    return new User(
      id ? new EntityId(id) : undefined,
      new Email(email),
      new UserName(name),
      passwordHash ? new HashedPassword(passwordHash) : undefined,
      new AuthProvider(provider),
      providerId,
      isEmailVerified,
      picture,
      createdAt ?? now,
      updatedAt ?? now,
    );
  }

  static createLocal(email: string, name: string, passwordHash: string, picture?: string): User {
    return User.create(undefined, email, name, passwordHash, "local", undefined, false, picture);
  }

  static createFromOAuth(
    email: string,
    name: string,
    provider: AuthProviderType,
    providerId: string,
    picture?: string,
  ): User {
    return User.create(
      undefined,
      email,
      name,
      undefined,
      provider,
      providerId,
      true, // OAuth users have verified emails
      picture,
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      email: this.email.value,
      name: this.name.value,
      provider: this.provider.value,
      providerId: this.providerId,
      isEmailVerified: this.isEmailVerified,
      picture: this.picture,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
