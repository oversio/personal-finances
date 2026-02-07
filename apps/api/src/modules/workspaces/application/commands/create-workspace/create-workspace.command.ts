export class CreateWorkspaceCommand {
  constructor(
    public readonly name: string,
    public readonly ownerId: string,
    public readonly currency: string = "USD",
    public readonly timezone?: string,
    public readonly isDefault: boolean = false,
  ) {}
}
