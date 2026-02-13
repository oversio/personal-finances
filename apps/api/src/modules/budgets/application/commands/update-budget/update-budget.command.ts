export class UpdateBudgetCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly amount?: number,
    public readonly period?: string,
    public readonly alertThreshold?: number | null,
  ) {}
}
