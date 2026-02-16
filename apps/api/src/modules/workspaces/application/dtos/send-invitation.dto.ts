import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const INVITATION_ROLES = ["admin", "member"] as const;

const sendInvitationSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  role: z.enum(INVITATION_ROLES, { error: "Invalid role" }).default("member"),
});

export class SendInvitationDto extends createZodDto(sendInvitationSchema) {}
