import { Injectable } from "@nestjs/common";
import Papa from "papaparse";
import type { FileParserService, ParsedFile, ParsedRow } from "../../application/ports";

@Injectable()
export class CsvParserService implements FileParserService {
  private readonly supportedMimeTypes = [
    "text/csv",
    "application/csv",
    "text/comma-separated-values",
  ];

  supports(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType.toLowerCase());
  }

  async parse(buffer: Buffer): Promise<ParsedFile> {
    const content = buffer.toString("utf-8");

    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(content, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
        complete: (results: Papa.ParseResult<Record<string, string>>) => {
          if (results.errors.length > 0) {
            const errorMessages = results.errors
              .map((e: Papa.ParseError) => `Row ${e.row}: ${e.message}`)
              .join("; ");
            reject(new Error(`CSV parsing error: ${errorMessages}`));
            return;
          }

          const headers = results.meta.fields ?? [];
          const rows: ParsedRow[] = results.data.map((row, index) => ({
            rowNumber: index + 1,
            raw: row,
          }));

          resolve({ headers, rows });
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  }
}
