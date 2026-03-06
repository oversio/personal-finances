export const IMPORT_SESSION_REPOSITORY = Symbol("IMPORT_SESSION_REPOSITORY");

export interface CategoryToCreate {
  name: string;
  type: "income" | "expense";
  subcategories: string[];
}

export interface ImportRowData {
  type: string;
  accountName: string;
  toAccountName?: string;
  categoryName?: string;
  subcategoryName?: string;
  amount: number;
  currency: string;
  notes?: string;
  date: string;
}

export interface ImportRowError {
  field: string;
  message: string;
  code: string;
}

export interface ImportRow {
  rowNumber: number;
  status: "valid" | "invalid" | "warning";
  data: ImportRowData;
  resolvedIds: {
    accountId?: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
  };
  errors: ImportRowError[];
}

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
