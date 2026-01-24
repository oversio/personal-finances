export class LogoutCommand {
  constructor(
    public readonly refreshToken: string,
    public readonly logoutAll: boolean = false,
    public readonly userId?: string
  ) {}
}
