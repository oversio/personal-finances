import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from "@/modules/transactions/application/ports";

import { Category } from "../../../domain/entities";
import { CategoryInUseError, CategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../ports";
import { ArchiveCategoryCommand } from "./archive-category.command";
import { ArchiveCategoryHandler } from "./archive-category.handler";

describe("ArchiveCategoryHandler", () => {
  let handler: ArchiveCategoryHandler;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockCategoryRepository: jest.Mocked<CategoryRepository> = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      findByNameTypeAndWorkspace: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockTransactionRepository = {
      existsByCategory: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepository>;

    const mockEventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchiveCategoryHandler,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    handler = module.get<ArchiveCategoryHandler>(ArchiveCategoryHandler);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestCategory = (overrides?: { id?: string; workspaceId?: string; name?: string }) =>
    Category.create({
      id: overrides?.id ?? "cat-123",
      workspaceId: overrides?.workspaceId ?? "workspace-123",
      name: overrides?.name ?? "Test Category",
      type: "expense",
    });

  describe("execute", () => {
    const validCommand = new ArchiveCategoryCommand("cat-123", "workspace-123");

    it("should archive category successfully", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(false);
      categoryRepository.update.mockResolvedValue(category.archive());

      await handler.execute(validCommand);

      expect(categoryRepository.update).toHaveBeenCalledTimes(1);
      const updatedCategory = categoryRepository.update.mock.calls[0][0];
      expect(updatedCategory.isArchived).toBe(true);
    });

    it("should throw CategoryNotFoundError when category does not exist", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(validCommand)).rejects.toThrow(CategoryNotFoundError);
      expect(categoryRepository.update).not.toHaveBeenCalled();
    });

    it("should throw CategoryNotFoundError when category belongs to different workspace", async () => {
      const categoryInDifferentWorkspace = createTestCategory({
        workspaceId: "other-workspace",
      });

      categoryRepository.findById.mockResolvedValue(categoryInDifferentWorkspace);

      await expect(handler.execute(validCommand)).rejects.toThrow(CategoryNotFoundError);
      expect(transactionRepository.existsByCategory).not.toHaveBeenCalled();
    });

    it("should throw CategoryInUseError when category has transactions", async () => {
      const category = createTestCategory({ name: "Food" });

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(true);

      await expect(handler.execute(validCommand)).rejects.toThrow(CategoryInUseError);
      expect(categoryRepository.update).not.toHaveBeenCalled();
    });

    it("should include category name in CategoryInUseError", async () => {
      const category = createTestCategory({ name: "Food & Dining" });

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(true);

      try {
        await handler.execute(validCommand);
        fail("Expected CategoryInUseError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(CategoryInUseError);
        expect((error as CategoryInUseError).message).toContain("Food & Dining");
      }
    });

    it("should check transactions with correct parameters", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(false);
      categoryRepository.update.mockResolvedValue(category.archive());

      await handler.execute(validCommand);

      expect(transactionRepository.existsByCategory).toHaveBeenCalledWith(
        "workspace-123",
        "cat-123",
      );
    });

    it("should emit category.archived event", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(false);
      categoryRepository.update.mockResolvedValue(category.archive());

      await handler.execute(validCommand);

      expect(eventEmitter.emit).toHaveBeenCalledWith("category.archived", {
        categoryId: "cat-123",
        workspaceId: "workspace-123",
      });
    });

    it("should not emit event when category not found", async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(validCommand)).rejects.toThrow();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it("should not emit event when category has transactions", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(true);

      await expect(handler.execute(validCommand)).rejects.toThrow();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it("should return void on success", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(false);
      categoryRepository.update.mockResolvedValue(category.archive());

      const result = await handler.execute(validCommand);

      expect(result).toBeUndefined();
    });

    it("should call findById with correct id", async () => {
      const category = createTestCategory();

      categoryRepository.findById.mockResolvedValue(category);
      transactionRepository.existsByCategory.mockResolvedValue(false);
      categoryRepository.update.mockResolvedValue(category.archive());

      await handler.execute(validCommand);

      expect(categoryRepository.findById).toHaveBeenCalledWith("cat-123");
    });
  });
});
