export class ChangeMemberRoleCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly role: string,
  ) {}
}
