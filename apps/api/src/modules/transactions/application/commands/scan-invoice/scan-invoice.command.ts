export class ScanInvoiceCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly fileName: string,
    public readonly buffer: Buffer,
    public readonly mimeType: string,
  ) {}
}
