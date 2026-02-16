export class ResendInvitationCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly invitationId: string,
    public readonly resendByUserId: string,
  ) {}
}
