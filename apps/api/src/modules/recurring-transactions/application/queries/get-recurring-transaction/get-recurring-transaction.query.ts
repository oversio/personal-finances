export class GetRecurringTransactionQuery {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
