import { EntityId } from "../../../shared/domain/value-objects";

export class RefreshToken {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly userId: EntityId,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly revokedAt: Date | undefined,
    public readonly userAgent: string | undefined,
    public readonly ipAddress: string | undefined,
  ) {}

  static create(
    id: string | undefined,
    userId: string,
    token: string,
    expiresAt: Date,
    createdAt?: Date,
    revokedAt?: Date,
    userAgent?: string,
    ipAddress?: string,
  ): RefreshToken {
    return new RefreshToken(
      id ? new EntityId(id) : undefined,
      new EntityId(userId),
      token,
      expiresAt,
      createdAt ?? new Date(),
      revokedAt,
      userAgent,
      ipAddress,
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.revokedAt !== undefined;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      userId: this.userId.value,
      token: this.token,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      revokedAt: this.revokedAt,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress,
    };
  }
}
