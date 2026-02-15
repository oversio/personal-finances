export class UpdateWorkspaceCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly currency?: string,
    public readonly timezone?: string,
  ) {}
}
