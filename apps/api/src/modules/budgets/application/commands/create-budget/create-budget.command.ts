export class CreateBudgetCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly categoryId: string,
    public readonly subcategoryId: string | undefined,
    public readonly name: string,
    public readonly amount: number,
    public readonly period: string,
    public readonly startDate: Date,
    public readonly alertThreshold?: number,
  ) {}
}
