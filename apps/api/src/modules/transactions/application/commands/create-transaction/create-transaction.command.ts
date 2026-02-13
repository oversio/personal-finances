export class CreateTransactionCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly type: string,
    public readonly accountId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly date: Date,
    public readonly createdBy: string,
    public readonly toAccountId?: string,
    public readonly categoryId?: string,
    public readonly subcategoryId?: string,
    public readonly notes?: string,
  ) {}
}
