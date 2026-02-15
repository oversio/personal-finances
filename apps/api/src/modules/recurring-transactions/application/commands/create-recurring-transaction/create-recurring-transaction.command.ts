export class CreateRecurringTransactionCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly type: string,
    public readonly accountId: string,
    public readonly categoryId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly frequency: string,
    public readonly interval: number,
    public readonly startDate: Date,
    public readonly createdBy: string,
    public readonly subcategoryId?: string,
    public readonly notes?: string,
    public readonly dayOfWeek?: number,
    public readonly dayOfMonth?: number,
    public readonly monthOfYear?: number,
    public readonly endDate?: Date,
  ) {}
}
