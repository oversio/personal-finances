export class RemoveMemberCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
  ) {}
}
