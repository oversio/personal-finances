export class CreateAccountCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly type: string,
    public readonly currency: string,
    public readonly initialBalance: number,
    public readonly color?: string,
    public readonly icon?: string,
  ) {}
}
