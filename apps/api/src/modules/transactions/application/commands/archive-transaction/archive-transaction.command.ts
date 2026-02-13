export class ArchiveTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
