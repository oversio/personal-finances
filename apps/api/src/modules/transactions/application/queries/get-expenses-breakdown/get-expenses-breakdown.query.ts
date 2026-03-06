export class GetExpensesBreakdownQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly year: number,
    public readonly currency?: string,
  ) {}
}
