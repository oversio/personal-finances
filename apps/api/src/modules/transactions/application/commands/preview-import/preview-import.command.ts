export class PreviewImportCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly fileName: string,
    public readonly fileBuffer: Buffer,
    public readonly mimeType: string,
  ) {}
}
