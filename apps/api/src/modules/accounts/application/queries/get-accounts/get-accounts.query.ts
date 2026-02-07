export class GetAccountsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly includeArchived: boolean = false,
  ) {}
}
