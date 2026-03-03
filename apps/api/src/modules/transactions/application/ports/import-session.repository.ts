import type {
  CategoryToCreate,
  ImportRow,
  ImportRowData,
  ImportRowError,
} from "../../infrastructure/persistence/schemas/import-session.schema";

export const IMPORT_SESSION_REPOSITORY = Symbol("IMPORT_SESSION_REPOSITORY");

export interface ImportSession {
  id: string;
  workspaceId: string;
  userId: string;
  fileName: string;
  rows: ImportRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
  categoriesToCreate: CategoryToCreate[];
  createdAt: Date;
}

export interface CreateImportSessionData {
  workspaceId: string;
  userId: string;
  fileName: string;
  rows: ImportRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
  categoriesToCreate: CategoryToCreate[];
}

export interface ImportSessionRepository {
  create(data: CreateImportSessionData): Promise<ImportSession>;
  findById(id: string): Promise<ImportSession | null>;
  delete(id: string): Promise<void>;
}

export type { CategoryToCreate, ImportRow, ImportRowData, ImportRowError };
