export const FILE_PARSER_SERVICE = Symbol("FILE_PARSER_SERVICE");

export interface ParsedRow {
  rowNumber: number;
  raw: Record<string, string>;
}

export interface ParsedFile {
  headers: string[];
  rows: ParsedRow[];
}

export interface FileParserService {
  supports(mimeType: string): boolean;
  parse(buffer: Buffer): Promise<ParsedFile>;
}
