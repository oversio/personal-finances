import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { Category } from "@/modules/categories/domain/entities";
import { Subcategory } from "@/modules/categories/domain/value-objects";
import { matchesFlexibly } from "@/modules/shared";
import { Transaction, type TransactionPrimitives } from "../../../domain/entities";
import {
  IMPORT_SESSION_REPOSITORY,
  type ImportSessionRepository,
  type ImportRow,
  type ImportSession,
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from "../../ports";
import { ConfirmImportCommand } from "./confirm-import.command";

export interface ImportedTransaction {
  id: string;
  rowNumber: number;
}

export interface CreatedCategory {
  id: string;
  name: string;
  type: string;
  subcategoriesCreated: string[];
}

export interface ConfirmImportResult {
  imported: number;
  skipped: number;
  transactions: ImportedTransaction[];
  createdCategories: CreatedCategory[];
}

@Injectable()
export class ConfirmImportHandler {
  constructor(
    @Inject(IMPORT_SESSION_REPOSITORY)
    private readonly importSessionRepository: ImportSessionRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ConfirmImportCommand): Promise<ConfirmImportResult> {
    // Find session
    const session = await this.importSessionRepository.findById(command.sessionId);
    if (!session) {
      throw new NotFoundException(
        "Sesión de importación no encontrada o expirada. Por favor, sube el archivo nuevamente.",
      );
    }

    // Verify ownership
    if (session.workspaceId !== command.workspaceId || session.userId !== command.userId) {
      throw new ForbiddenException("No tienes acceso a esta sesión de importación");
    }

    // Separate rows by status
    const invalidRows = session.rows.filter(r => r.status === "invalid");
    const validRows = session.rows.filter(r => r.status === "valid");
    const warningRows = session.rows.filter(r => r.status === "warning");

    if (invalidRows.length > 0 && !command.skipInvalid) {
      throw new BadRequestException(
        `Hay ${invalidRows.length} filas con errores. Corrige los errores o selecciona "omitir inválidas" para continuar.`,
      );
    }

    // Determine which rows to import
    let rowsToImport = [...validRows];
    const createdCategories: CreatedCategory[] = [];

    // Handle warning rows (missing categories)
    if (warningRows.length > 0 && command.createMissingCategories) {
      // Create missing categories and resolve IDs for warning rows
      const categoryIdMap = await this.createMissingCategories(
        session,
        command.workspaceId,
        createdCategories,
      );

      // Resolve category IDs for warning rows
      const resolvedWarningRows = await this.resolveWarningRows(
        warningRows,
        categoryIdMap,
        command.workspaceId,
      );

      rowsToImport = [...validRows, ...resolvedWarningRows];
    }

    if (rowsToImport.length === 0) {
      throw new BadRequestException("No hay filas válidas para importar");
    }

    // Create transactions
    const importedTransactions: ImportedTransaction[] = [];

    for (const row of rowsToImport) {
      const savedTransaction = await this.createTransaction(row, command);
      importedTransactions.push({
        id: savedTransaction.id!,
        rowNumber: row.rowNumber,
      });
    }

    // Calculate skipped count
    const skippedCount =
      invalidRows.length + (command.createMissingCategories ? 0 : warningRows.length);

    // Delete session
    await this.importSessionRepository.delete(command.sessionId);

    return {
      imported: importedTransactions.length,
      skipped: skippedCount,
      transactions: importedTransactions,
      createdCategories,
    };
  }

  private async createTransaction(
    row: ImportRow,
    command: ConfirmImportCommand,
  ): Promise<TransactionPrimitives> {
    const { data, resolvedIds } = row;

    const transaction = Transaction.create({
      workspaceId: command.workspaceId,
      type: data.type,
      accountId: resolvedIds.accountId!,
      toAccountId: resolvedIds.toAccountId,
      categoryId: resolvedIds.categoryId,
      subcategoryId: resolvedIds.subcategoryId,
      amount: data.amount,
      currency: data.currency,
      notes: data.notes,
      date: new Date(data.date),
      createdBy: command.userId,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Emit domain event for balance updates
    this.eventEmitter.emit("transaction.created", {
      transactionId: savedTransaction.id!.value,
      workspaceId: command.workspaceId,
      type: savedTransaction.type.value,
      accountId: savedTransaction.accountId.value,
      toAccountId: savedTransaction.toAccountId?.value,
      amount: savedTransaction.amount.value,
    });

    return savedTransaction.toPrimitives();
  }

  private async createMissingCategories(
    session: ImportSession,
    workspaceId: string,
    createdCategories: CreatedCategory[],
  ): Promise<Map<string, { categoryId: string; subcategoryIds: Map<string, string> }>> {
    const categoryIdMap = new Map<
      string,
      { categoryId: string; subcategoryIds: Map<string, string> }
    >();

    for (const catToCreate of session.categoriesToCreate) {
      // Check if category already exists (might have been created in a previous import)
      const existingCategory = await this.categoryRepository.findByNameTypeAndWorkspace(
        catToCreate.name,
        catToCreate.type,
        workspaceId,
      );

      if (existingCategory) {
        // Category exists, maybe we need to add subcategories
        const existingPrimitives = existingCategory.toPrimitives();
        const subcategoryIds = new Map<string, string>();
        const subcategoriesCreated: string[] = [];

        // Map existing subcategories
        for (const sub of existingPrimitives.subcategories) {
          subcategoryIds.set(sub.name.toLowerCase(), sub.id);
        }

        // Add missing subcategories
        let updatedCategory = existingCategory;
        for (const subName of catToCreate.subcategories) {
          const normalizedSubName = subName.toLowerCase();
          if (!subcategoryIds.has(normalizedSubName)) {
            const newSubcategory = Subcategory.create({ name: subName });
            updatedCategory = updatedCategory.addSubcategory(newSubcategory);
            subcategoryIds.set(normalizedSubName, newSubcategory.id);
            subcategoriesCreated.push(subName);
          }
        }

        // Save if we added subcategories
        if (subcategoriesCreated.length > 0) {
          await this.categoryRepository.update(updatedCategory);
          createdCategories.push({
            id: existingPrimitives.id!,
            name: existingPrimitives.name,
            type: existingPrimitives.type,
            subcategoriesCreated,
          });
        }

        const key = `${catToCreate.type}:${catToCreate.name.toLowerCase()}`;
        categoryIdMap.set(key, { categoryId: existingPrimitives.id!, subcategoryIds });
      } else {
        // Create new category with subcategories
        const subcategories = catToCreate.subcategories.map(name => ({
          name,
        }));

        const newCategory = Category.create({
          workspaceId,
          name: catToCreate.name,
          type: catToCreate.type,
          subcategories,
        });

        const savedCategory = await this.categoryRepository.save(newCategory);
        const savedPrimitives = savedCategory.toPrimitives();

        // Build subcategory ID map
        const subcategoryIds = new Map<string, string>();
        for (const sub of savedPrimitives.subcategories) {
          subcategoryIds.set(sub.name.toLowerCase(), sub.id);
        }

        const key = `${catToCreate.type}:${catToCreate.name.toLowerCase()}`;
        categoryIdMap.set(key, { categoryId: savedPrimitives.id!, subcategoryIds });

        createdCategories.push({
          id: savedPrimitives.id!,
          name: savedPrimitives.name,
          type: savedPrimitives.type,
          subcategoriesCreated: catToCreate.subcategories,
        });
      }
    }

    return categoryIdMap;
  }

  private async resolveWarningRows(
    warningRows: ImportRow[],
    categoryIdMap: Map<string, { categoryId: string; subcategoryIds: Map<string, string> }>,
    workspaceId: string,
  ): Promise<ImportRow[]> {
    // Also load existing categories to resolve subcategories that were added to existing categories
    const existingCategories = await this.categoryRepository.findByWorkspaceId(workspaceId, false);

    return warningRows.map(row => {
      const { data, resolvedIds } = row;
      const categoryName = data.categoryName?.trim();
      const subcategoryName = data.subcategoryName?.trim();
      const type = data.type;

      // Check if category was created or already existed
      if (categoryName) {
        const key = `${type}:${categoryName.toLowerCase()}`;
        const created = categoryIdMap.get(key);

        if (created) {
          // Category was created or updated
          resolvedIds.categoryId = created.categoryId;
          if (subcategoryName) {
            resolvedIds.subcategoryId = created.subcategoryIds.get(subcategoryName.toLowerCase());
          }
        } else {
          // Category already existed (wasn't in categoriesToCreate but subcategory was added)
          const existingCat = existingCategories.find(
            c => c.type.value === type && matchesFlexibly(c.name.value, categoryName),
          );
          if (existingCat) {
            const catPrimitives = existingCat.toPrimitives();
            resolvedIds.categoryId = catPrimitives.id;
            if (subcategoryName) {
              const sub = catPrimitives.subcategories.find(s =>
                matchesFlexibly(s.name, subcategoryName),
              );
              resolvedIds.subcategoryId = sub?.id;
            }
          }
        }
      }

      return {
        ...row,
        resolvedIds,
        status: "valid" as const,
      };
    });
  }
}
