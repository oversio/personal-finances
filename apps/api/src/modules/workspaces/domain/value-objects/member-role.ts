import { z } from "zod";

const MEMBER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

type MemberRoleValue = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];

const schema = z.enum(["owner", "admin", "member"], {
  message: "Invalid member role",
});

export class MemberRole {
  readonly value: MemberRoleValue;

  constructor(value: string) {
    this.value = schema.parse(value) as MemberRoleValue;
  }

  static owner(): MemberRole {
    return new MemberRole(MEMBER_ROLES.OWNER);
  }

  static admin(): MemberRole {
    return new MemberRole(MEMBER_ROLES.ADMIN);
  }

  static member(): MemberRole {
    return new MemberRole(MEMBER_ROLES.MEMBER);
  }

  isOwner(): boolean {
    return this.value === MEMBER_ROLES.OWNER;
  }

  isAdmin(): boolean {
    return this.value === MEMBER_ROLES.ADMIN;
  }

  canManageMembers(): boolean {
    return this.value === MEMBER_ROLES.OWNER || this.value === MEMBER_ROLES.ADMIN;
  }
}
