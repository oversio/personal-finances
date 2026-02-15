export class PauseRecurringTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
