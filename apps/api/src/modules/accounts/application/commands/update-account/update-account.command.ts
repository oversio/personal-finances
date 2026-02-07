export class UpdateAccountCommand {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly type?: string,
    public readonly color?: string,
    public readonly icon?: string,
  ) {}
}
