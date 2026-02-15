import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const MEMBER_ROLES = ["admin", "member"] as const;

const changeMemberRoleSchema = z.object({
  role: z.enum(MEMBER_ROLES, { error: "Invalid role" }),
});

export class ChangeMemberRoleDto extends createZodDto(changeMemberRoleSchema) {}
