export class GetRecurringTransactionsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly type?: string,
    public readonly categoryId?: string,
    public readonly accountId?: string,
    public readonly isActive?: boolean,
    public readonly includeArchived: boolean = false,
  ) {}
}
