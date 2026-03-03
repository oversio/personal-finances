import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "@/modules/accounts/application/ports";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { matchesFlexibly, normalizeForMatch } from "@/modules/shared";
import { CURRENCIES } from "@/modules/workspaces";
import { TRANSACTION_TYPES } from "../../../domain/value-objects";
import {
  FILE_PARSER_SERVICE,
  type FileParserService,
  IMPORT_SESSION_REPOSITORY,
  type ImportSessionRepository,
  type CategoryToCreate,
  type ImportRow,
  type ImportRowData,
  type ImportRowError,
} from "../../ports";
import { PreviewImportCommand } from "./preview-import.command";

const HEADERS = [
  { name: "type", required: true },
  { name: "account", required: true },
  { name: "toAccount", required: false },
  { name: "category", required: false },
  { name: "subcategory", required: false },
  { name: "amount", required: true },
  { name: "currency", required: true },
  { name: "notes", required: false },
  { name: "date", required: true },
];

interface AccountLookup {
  id: string;
  name: string;
  normalizedName: string;
}

interface CategoryLookup {
  id: string;
  name: string;
  normalizedName: string;
  type: string;
  subcategories: Array<{
    id: string;
    name: string;
    normalizedName: string;
  }>;
}

export interface PreviewImportResult {
  sessionId: string;
  rows: ImportRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
  categoriesToCreate: CategoryToCreate[];
}

@Injectable()
export class PreviewImportHandler {
  constructor(
    @Inject(FILE_PARSER_SERVICE)
    private readonly fileParser: FileParserService,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    @Inject(IMPORT_SESSION_REPOSITORY)
    private readonly importSessionRepository: ImportSessionRepository,
  ) {}

  async execute(command: PreviewImportCommand): Promise<PreviewImportResult> {
    // Parse file
    const parsedFile = await this.fileParser.parse(command.fileBuffer);

    // Validate headers
    const missingHeaders = HEADERS.filter(
      h => h.required && !parsedFile.headers.includes(h.name),
    ).map(h => h.name);

    if (missingHeaders.length > 0) {
      throw new BadRequestException(`Faltan columnas requeridas: ${missingHeaders.join(", ")}`);
    }

    if (parsedFile.rows.length === 0) {
      throw new BadRequestException("El archivo no contiene datos");
    }

    // Load accounts and categories for matching
    const [accounts, categories] = await Promise.all([
      this.accountRepository.findByWorkspaceId(command.workspaceId, false),
      this.categoryRepository.findByWorkspaceId(command.workspaceId, false),
    ]);

    const accountLookup: AccountLookup[] = accounts.map(a => {
      const primitives = a.toPrimitives();
      return {
        id: primitives.id!,
        name: primitives.name,
        normalizedName: normalizeForMatch(primitives.name),
      };
    });

    const categoryLookup: CategoryLookup[] = categories.map(c => {
      const primitives = c.toPrimitives();
      return {
        id: primitives.id!,
        name: primitives.name,
        normalizedName: normalizeForMatch(primitives.name),
        type: primitives.type,
        subcategories: primitives.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          normalizedName: normalizeForMatch(sub.name),
        })),
      };
    });

    // Validate each row
    const validatedRows: ImportRow[] = parsedFile.rows.map(row =>
      this.validateRow(row.rowNumber, row.raw, accountLookup, categoryLookup),
    );

    // Aggregate categories to create from warning rows
    const categoriesToCreate = this.aggregateCategoriesToCreate(validatedRows);

    // Calculate summary
    const summary = {
      total: validatedRows.length,
      valid: validatedRows.filter(r => r.status === "valid").length,
      invalid: validatedRows.filter(r => r.status === "invalid").length,
      warnings: validatedRows.filter(r => r.status === "warning").length,
    };

    // Store session
    const session = await this.importSessionRepository.create({
      workspaceId: command.workspaceId,
      userId: command.userId,
      fileName: command.fileName,
      rows: validatedRows,
      summary,
      categoriesToCreate,
    });

    return {
      sessionId: session.id,
      rows: validatedRows,
      summary,
      categoriesToCreate,
    };
  }

  private validateRow(
    rowNumber: number,
    raw: Record<string, string>,
    accounts: AccountLookup[],
    categories: CategoryLookup[],
  ): ImportRow {
    const errors: ImportRowError[] = [];
    const resolvedIds: ImportRow["resolvedIds"] = {};

    // Extract and trim values
    const type = raw["type"]?.trim().toLowerCase() || "";
    const accountName = raw["account"]?.trim() || "";
    const toAccountName = raw["toaccount"]?.trim() || "";
    const categoryName = raw["category"]?.trim() || "";
    const subcategoryName = raw["subcategory"]?.trim() || "";
    const amountStr = raw["amount"]?.trim() || "";
    const currency = raw["currency"]?.trim().toUpperCase() || "";
    const notes = raw["notes"]?.trim() || "";
    const dateStr = raw["date"]?.trim() || "";

    // Validate type
    if (!type) {
      errors.push({
        field: "type",
        message: "El tipo de transacción es requerido",
        code: "TYPE_REQUIRED",
      });
    } else if (!TRANSACTION_TYPES.includes(type as (typeof TRANSACTION_TYPES)[number])) {
      errors.push({
        field: "type",
        message: `Tipo '${type}' inválido. Usa: income, expense, o transfer`,
        code: "INVALID_TYPE",
      });
    }

    // Validate account
    if (!accountName) {
      errors.push({
        field: "account",
        message: "La cuenta es requerida",
        code: "ACCOUNT_REQUIRED",
      });
    } else {
      const account = accounts.find(a => matchesFlexibly(a.name, accountName));
      if (!account) {
        errors.push({
          field: "account",
          message: `Cuenta '${accountName}' no encontrada`,
          code: "ACCOUNT_NOT_FOUND",
        });
      } else {
        resolvedIds.accountId = account.id;
      }
    }

    // Validate toAccount (for transfers)
    if (type === "transfer") {
      if (!toAccountName) {
        errors.push({
          field: "toAccount",
          message: "La cuenta destino es requerida para transferencias",
          code: "TO_ACCOUNT_REQUIRED",
        });
      } else {
        const toAccount = accounts.find(a => matchesFlexibly(a.name, toAccountName));
        if (!toAccount) {
          errors.push({
            field: "toAccount",
            message: `Cuenta destino '${toAccountName}' no encontrada`,
            code: "TO_ACCOUNT_NOT_FOUND",
          });
        } else {
          resolvedIds.toAccountId = toAccount.id;
        }
      }
    }

    // Validate category (for income/expense)
    // Track if we have category-related warnings (for warning status)
    let hasWarning = false;

    if (type === "income" || type === "expense") {
      if (!categoryName) {
        errors.push({
          field: "category",
          message: "La categoría es requerida para ingresos y gastos",
          code: "CATEGORY_REQUIRED",
        });
      } else {
        const category = categories.find(
          c => c.type === type && matchesFlexibly(c.name, categoryName),
        );
        if (!category) {
          // Category not found - will be created (warning, not error)
          errors.push({
            field: "category",
            message: `Categoría '${categoryName}' será creada como ${type === "income" ? "ingreso" : "gasto"}`,
            code: "CATEGORY_WILL_BE_CREATED",
          });
          hasWarning = true;

          // Subcategory will also be created if provided
          if (subcategoryName) {
            errors.push({
              field: "subcategory",
              message: `Subcategoría '${subcategoryName}' será creada en '${categoryName}'`,
              code: "SUBCATEGORY_WILL_BE_CREATED",
            });
          }
        } else {
          resolvedIds.categoryId = category.id;

          // Validate subcategory if provided
          if (subcategoryName) {
            const subcategory = category.subcategories.find(s =>
              matchesFlexibly(s.name, subcategoryName),
            );
            if (!subcategory) {
              // Subcategory not found in existing category - will be created
              errors.push({
                field: "subcategory",
                message: `Subcategoría '${subcategoryName}' será creada en '${category.name}'`,
                code: "SUBCATEGORY_WILL_BE_CREATED",
              });
              hasWarning = true;
            } else {
              resolvedIds.subcategoryId = subcategory.id;
            }
          }
        }
      }
    }

    // Validate amount
    const amount = parseFloat(amountStr);
    if (!amountStr) {
      errors.push({
        field: "amount",
        message: "El monto es requerido",
        code: "AMOUNT_REQUIRED",
      });
    } else if (isNaN(amount) || amount <= 0) {
      errors.push({
        field: "amount",
        message: `Monto '${amountStr}' inválido. Debe ser un número positivo`,
        code: "INVALID_AMOUNT",
      });
    }

    // Validate currency
    if (!currency) {
      errors.push({
        field: "currency",
        message: "La moneda es requerida",
        code: "CURRENCY_REQUIRED",
      });
    } else if (!CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) {
      errors.push({
        field: "currency",
        message: `Moneda '${currency}' inválida. Usa: ${CURRENCIES.join(", ")}`,
        code: "INVALID_CURRENCY",
      });
    }

    // Validate date
    if (!dateStr) {
      errors.push({
        field: "date",
        message: "La fecha es requerida",
        code: "DATE_REQUIRED",
      });
    } else if (!this.isValidDate(dateStr)) {
      errors.push({
        field: "date",
        message: `Fecha '${dateStr}' inválida. Usa formato YYYY-MM-DD`,
        code: "INVALID_DATE",
      });
    }

    const data: ImportRowData = {
      type,
      accountName,
      toAccountName: toAccountName || undefined,
      categoryName: categoryName || undefined,
      subcategoryName: subcategoryName || undefined,
      amount: isNaN(amount) ? 0 : amount,
      currency,
      notes: notes || undefined,
      date: dateStr,
    };

    // Determine status: check for hard errors (not warnings)
    const hardErrors = errors.filter(
      e => e.code !== "CATEGORY_WILL_BE_CREATED" && e.code !== "SUBCATEGORY_WILL_BE_CREATED",
    );

    let status: ImportRow["status"];
    if (hardErrors.length > 0) {
      status = "invalid";
    } else if (hasWarning) {
      status = "warning";
    } else {
      status = "valid";
    }

    return {
      rowNumber,
      status,
      data,
      resolvedIds,
      errors,
    };
  }

  private isValidDate(dateStr: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  private aggregateCategoriesToCreate(rows: ImportRow[]): CategoryToCreate[] {
    const categoryMap = new Map<string, CategoryToCreate>();

    for (const row of rows) {
      if (row.status !== "warning") continue;

      const { data, errors } = row;
      const categoryName = data.categoryName?.trim();
      const subcategoryName = data.subcategoryName?.trim();
      const type = data.type as "income" | "expense";

      // Check if this row has a category creation warning
      const hasCategoryCreation = errors.some(e => e.code === "CATEGORY_WILL_BE_CREATED");
      const hasSubcategoryCreation = errors.some(e => e.code === "SUBCATEGORY_WILL_BE_CREATED");

      if (hasCategoryCreation && categoryName) {
        // Category will be created
        const key = `${type}:${categoryName.toLowerCase()}`;
        const existing = categoryMap.get(key);

        if (existing) {
          // Add subcategory if not already present
          if (subcategoryName && !existing.subcategories.includes(subcategoryName)) {
            existing.subcategories.push(subcategoryName);
          }
        } else {
          categoryMap.set(key, {
            name: categoryName,
            type,
            subcategories: subcategoryName ? [subcategoryName] : [],
          });
        }
      } else if (hasSubcategoryCreation && categoryName && subcategoryName) {
        // Only subcategory will be created (category exists)
        // We need to track this for adding subcategory to existing category
        const key = `${type}:${categoryName.toLowerCase()}`;
        const existing = categoryMap.get(key);

        if (existing) {
          if (!existing.subcategories.includes(subcategoryName)) {
            existing.subcategories.push(subcategoryName);
          }
        } else {
          // This is a subcategory for an existing category
          // We'll track it separately with empty name to indicate it's just subcategory addition
          categoryMap.set(key, {
            name: categoryName,
            type,
            subcategories: [subcategoryName],
          });
        }
      }
    }

    return Array.from(categoryMap.values());
  }
}
