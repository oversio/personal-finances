import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

import { Category } from "../../../domain/entities";
import { CategoryAlreadyExistsError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../ports";
import { CreateCategoryCommand } from "./create-category.command";
import { CreateCategoryHandler } from "./create-category.handler";

describe("CreateCategoryHandler", () => {
  let handler: CreateCategoryHandler;
  let categoryRepository: jest.Mocked<CategoryRepository>;
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

    const mockEventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryHandler,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    handler = module.get<CreateCategoryHandler>(CreateCategoryHandler);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const validCommand = new CreateCategoryCommand(
      "workspace-123",
      "Food & Dining",
      "expense",
      undefined,
      "utensils",
      "#FF5733",
    );

    it("should create a category successfully", async () => {
      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
        icon: "utensils",
        color: "#FF5733",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      const result = await handler.execute(validCommand);

      expect(result).toEqual(savedCategory.toPrimitives());
    });

    it("should check for duplicate category", async () => {
      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(
        Category.create({
          id: "cat-123",
          workspaceId: "workspace-123",
          name: "Food & Dining",
          type: "expense",
        }),
      );

      await handler.execute(validCommand);

      expect(categoryRepository.findByNameTypeAndWorkspace).toHaveBeenCalledWith(
        "Food & Dining",
        "expense",
        "workspace-123",
      );
    });

    it("should throw CategoryAlreadyExistsError when duplicate exists", async () => {
      const existingCategory = Category.create({
        id: "existing-cat",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(existingCategory);

      await expect(handler.execute(validCommand)).rejects.toThrow(CategoryAlreadyExistsError);
      expect(categoryRepository.save).not.toHaveBeenCalled();
    });

    it("should save category to repository", async () => {
      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      await handler.execute(validCommand);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      const savedArg = categoryRepository.save.mock.calls[0][0];
      expect(savedArg).toBeInstanceOf(Category);
      expect(savedArg.name.value).toBe("Food & Dining");
      expect(savedArg.type.value).toBe("expense");
      expect(savedArg.workspaceId.value).toBe("workspace-123");
    });

    it("should emit category.created event", async () => {
      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      await handler.execute(validCommand);

      expect(eventEmitter.emit).toHaveBeenCalledWith("category.created", {
        categoryId: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
      });
    });

    it("should create category with subcategories", async () => {
      const commandWithSubcategories = new CreateCategoryCommand(
        "workspace-123",
        "Food & Dining",
        "expense",
        [{ name: "Restaurants" }, { name: "Groceries", icon: "cart" }],
      );

      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
        subcategories: [{ name: "Restaurants" }, { name: "Groceries", icon: "cart" }],
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      const result = await handler.execute(commandWithSubcategories);

      expect(result.subcategories).toHaveLength(2);
      expect(result.subcategories[0].name).toBe("Restaurants");
      expect(result.subcategories[1].name).toBe("Groceries");
    });

    it("should create income category", async () => {
      const incomeCommand = new CreateCategoryCommand("workspace-123", "Salary", "income");

      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Salary",
        type: "income",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      const result = await handler.execute(incomeCommand);

      expect(result.type).toBe("income");
    });

    it("should return toPrimitives result", async () => {
      const savedCategory = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food & Dining",
        type: "expense",
        icon: "food",
        color: "#AABBCC",
      });

      categoryRepository.findByNameTypeAndWorkspace.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue(savedCategory);

      const result = await handler.execute(validCommand);

      expect(result.id).toBe("cat-123");
      expect(result.workspaceId).toBe("workspace-123");
      expect(result.name).toBe("Food & Dining");
      expect(result.type).toBe("expense");
      expect(result.icon).toBe("food");
      expect(result.color).toBe("#AABBCC");
      expect(result.isArchived).toBe(false);
      expect(result.subcategories).toEqual([]);
    });
  });
});
