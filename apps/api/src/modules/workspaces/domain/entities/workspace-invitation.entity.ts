import { randomBytes } from "crypto";
import { EntityId } from "@/modules/shared/domain/value-objects";
import { MemberRole } from "../value-objects";

const INVITATION_EXPIRATION_DAYS = 7;

export class WorkspaceInvitation {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly email: string,
    public readonly role: MemberRole,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly invitedBy: EntityId,
    public readonly createdAt: Date,
    private _acceptedAt: Date | undefined,
    private _revokedAt: Date | undefined,
    private _acceptedByUserId: EntityId | undefined,
  ) {}

  static create(
    workspaceId: string,
    email: string,
    role: string,
    invitedBy: string,
  ): WorkspaceInvitation {
    const token = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITATION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    return new WorkspaceInvitation(
      undefined,
      new EntityId(workspaceId),
      email.toLowerCase(),
      new MemberRole(role),
      token,
      expiresAt,
      new EntityId(invitedBy),
      now,
      undefined,
      undefined,
      undefined,
    );
  }

  static fromPrimitives(data: {
    id: string;
    workspaceId: string;
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
    invitedBy: string;
    createdAt: Date;
    acceptedAt?: Date;
    revokedAt?: Date;
    acceptedByUserId?: string;
  }): WorkspaceInvitation {
    return new WorkspaceInvitation(
      new EntityId(data.id),
      new EntityId(data.workspaceId),
      data.email,
      new MemberRole(data.role),
      data.token,
      data.expiresAt,
      new EntityId(data.invitedBy),
      data.createdAt,
      data.acceptedAt,
      data.revokedAt,
      data.acceptedByUserId ? new EntityId(data.acceptedByUserId) : undefined,
    );
  }

  get acceptedAt(): Date | undefined {
    return this._acceptedAt;
  }

  get revokedAt(): Date | undefined {
    return this._revokedAt;
  }

  get acceptedByUserId(): EntityId | undefined {
    return this._acceptedByUserId;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this._revokedAt !== undefined;
  }

  isAccepted(): boolean {
    return this._acceptedAt !== undefined;
  }

  isPending(): boolean {
    return !this.isExpired() && !this.isRevoked() && !this.isAccepted();
  }

  accept(userId: string): WorkspaceInvitation {
    return new WorkspaceInvitation(
      this.id,
      this.workspaceId,
      this.email,
      this.role,
      this.token,
      this.expiresAt,
      this.invitedBy,
      this.createdAt,
      new Date(),
      this._revokedAt,
      new EntityId(userId),
    );
  }

  revoke(): WorkspaceInvitation {
    return new WorkspaceInvitation(
      this.id,
      this.workspaceId,
      this.email,
      this.role,
      this.token,
      this.expiresAt,
      this.invitedBy,
      this.createdAt,
      this._acceptedAt,
      new Date(),
      this._acceptedByUserId,
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      email: this.email,
      role: this.role.value,
      token: this.token,
      expiresAt: this.expiresAt,
      invitedBy: this.invitedBy.value,
      createdAt: this.createdAt,
      acceptedAt: this._acceptedAt,
      revokedAt: this._revokedAt,
      acceptedByUserId: this._acceptedByUserId?.value,
    };
  }
}
