export class AddSubcategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly icon?: string,
  ) {}
}
