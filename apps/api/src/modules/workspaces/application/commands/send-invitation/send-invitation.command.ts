export class SendInvitationCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly invitedByUserId: string,
  ) {}
}
