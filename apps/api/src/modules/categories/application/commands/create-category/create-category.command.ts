export class CreateCategoryCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly type: string,
    public readonly subcategories?: Array<{ name: string; icon?: string }>,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}
