import { z } from "zod";

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency: z.string(),
  timezone: z.string().nullable().optional(),
  isDefault: z.boolean(),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
