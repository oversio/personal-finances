export class AcceptInvitationCommand {
  constructor(
    public readonly token: string,
    public readonly userId: string,
    public readonly userEmail: string,
  ) {}
}
