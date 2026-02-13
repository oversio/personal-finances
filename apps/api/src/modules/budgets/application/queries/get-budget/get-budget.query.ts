export class GetBudgetQuery {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
