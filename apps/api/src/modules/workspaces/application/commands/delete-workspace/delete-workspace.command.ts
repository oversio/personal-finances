export class DeleteWorkspaceCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
  ) {}
}
