export class GetTransactionsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly accountId?: string,
    public readonly categoryId?: string,
    public readonly type?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly includeArchived: boolean = false,
  ) {}
}
