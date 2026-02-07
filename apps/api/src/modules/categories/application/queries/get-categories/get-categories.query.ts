export class GetCategoriesQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly type?: string,
    public readonly includeArchived: boolean = false,
  ) {}
}
