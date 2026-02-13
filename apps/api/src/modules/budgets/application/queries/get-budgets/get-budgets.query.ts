export class GetBudgetsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly includeArchived: boolean = false,
  ) {}
}
