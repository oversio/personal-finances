import { EntityId } from "../../../shared/domain/value-objects";
import { MemberRole } from "../value-objects";

export class WorkspaceMember {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly userId: EntityId,
    public readonly role: MemberRole,
    public readonly invitedBy: EntityId | undefined,
    public readonly invitedAt: Date,
    public readonly joinedAt: Date | undefined,
    public readonly isActive: boolean
  ) {}

  static create(
    id: string | undefined,
    workspaceId: string,
    userId: string,
    role: string,
    invitedBy?: string,
    invitedAt?: Date,
    joinedAt?: Date,
    isActive: boolean = true
  ): WorkspaceMember {
    return new WorkspaceMember(
      id ? new EntityId(id) : undefined,
      new EntityId(workspaceId),
      new EntityId(userId),
      new MemberRole(role),
      invitedBy ? new EntityId(invitedBy) : undefined,
      invitedAt ?? new Date(),
      joinedAt,
      isActive
    );
  }

  static createOwner(workspaceId: string, userId: string): WorkspaceMember {
    const now = new Date();
    return WorkspaceMember.create(
      undefined,
      workspaceId,
      userId,
      "owner",
      undefined,
      now,
      now, // Owner joins immediately
      true
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      userId: this.userId.value,
      role: this.role.value,
      invitedBy: this.invitedBy?.value,
      invitedAt: this.invitedAt,
      joinedAt: this.joinedAt,
      isActive: this.isActive,
    };
  }
}
