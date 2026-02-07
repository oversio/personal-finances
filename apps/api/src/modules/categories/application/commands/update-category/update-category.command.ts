export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly type?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}
