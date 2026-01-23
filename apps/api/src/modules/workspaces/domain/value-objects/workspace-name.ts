import { z } from "zod";

const schema = z
  .string()
  .min(1, "Workspace name is required")
  .max(100, "Workspace name must be less than 100 characters");

export class WorkspaceName {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }
}
