export class GetAccountQuery {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
  ) {}
}
