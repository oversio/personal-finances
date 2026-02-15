export class ProcessRecurringTransactionsCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly asOfDate: Date = new Date(),
  ) {}
}
