export class UpdateRecurringTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly type?: string,
    public readonly accountId?: string,
    public readonly categoryId?: string,
    public readonly subcategoryId?: string | null,
    public readonly amount?: number,
    public readonly notes?: string | null,
    public readonly frequency?: string,
    public readonly interval?: number,
    public readonly dayOfWeek?: number | null,
    public readonly dayOfMonth?: number | null,
    public readonly monthOfYear?: number | null,
    public readonly startDate?: Date,
    public readonly endDate?: Date | null,
  ) {}
}
