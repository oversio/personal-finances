import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const MEMBER_ROLES = ["admin", "member"] as const;

const inviteMemberSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  role: z.enum(MEMBER_ROLES, { error: "Invalid role" }).default("member"),
});

export class InviteMemberDto extends createZodDto(inviteMemberSchema) {}
