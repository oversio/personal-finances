export class UpdateSubcategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly subcategoryId: string,
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly icon?: string,
  ) {}
}
