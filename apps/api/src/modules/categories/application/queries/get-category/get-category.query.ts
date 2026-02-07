export class GetCategoryQuery {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
