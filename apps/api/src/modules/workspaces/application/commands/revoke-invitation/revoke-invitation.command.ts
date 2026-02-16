export class RevokeInvitationCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly invitationId: string,
  ) {}
}
