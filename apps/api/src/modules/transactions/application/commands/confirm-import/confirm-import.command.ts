export class ConfirmImportCommand {
  constructor(
    public readonly sessionId: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly skipInvalid: boolean,
    public readonly createMissingCategories: boolean,
  ) {}
}
