export class UpdateTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly type?: string,
    public readonly accountId?: string,
    public readonly toAccountId?: string | null,
    public readonly categoryId?: string | null,
    public readonly subcategoryId?: string | null,
    public readonly amount?: number,
    public readonly notes?: string | null,
    public readonly date?: Date,
  ) {}
}
