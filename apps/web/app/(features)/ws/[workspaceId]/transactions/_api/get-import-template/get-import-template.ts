export function getImportTemplateUrl(workspaceId: string): string {
  return `/api/v1/ws/${workspaceId}/transactions/import/template`;
}
