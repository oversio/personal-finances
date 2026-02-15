export class ArchiveRecurringTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
