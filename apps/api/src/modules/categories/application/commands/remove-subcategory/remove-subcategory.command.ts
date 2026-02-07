export class RemoveSubcategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly subcategoryId: string,
    public readonly workspaceId: string,
  ) {}
}
