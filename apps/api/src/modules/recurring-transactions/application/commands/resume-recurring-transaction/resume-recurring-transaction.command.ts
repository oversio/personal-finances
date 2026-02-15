export class ResumeRecurringTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
