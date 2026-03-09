import { Test, TestingModule } from "@nestjs/testing";

import { Category } from "../../../domain/entities";
import { CATEGORY_REPOSITORY, CategoryRepository } from "../../ports";
import { GetCategoriesHandler } from "./get-categories.handler";
import { GetCategoriesQuery } from "./get-categories.query";

describe("GetCategoriesHandler", () => {
  let handler: GetCategoriesHandler;
  let categoryRepository: jest.Mocked<CategoryRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesHandler,
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    handler = module.get<GetCategoriesHandler>(GetCategoriesHandler);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestCategory = (overrides: {
    id?: string;
    name?: string;
    type?: string;
    isArchived?: boolean;
  }) =>
    Category.create({
      id: overrides.id ?? "cat-123",
      workspaceId: "workspace-123",
      name: overrides.name ?? "Test Category",
      type: overrides.type ?? "expense",
      isArchived: overrides.isArchived ?? false,
    });

  describe("execute", () => {
    it("should return categories for workspace", async () => {
      const categories = [
        createTestCategory({ id: "cat-1", name: "Food" }),
        createTestCategory({ id: "cat-2", name: "Transport" }),
      ];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("cat-1");
      expect(result[1].id).toBe("cat-2");
    });

    it("should call repository with correct parameters", async () => {
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetCategoriesQuery("workspace-123", undefined, true);
      await handler.execute(query);

      expect(categoryRepository.findByWorkspaceId).toHaveBeenCalledWith("workspace-123", true);
    });

    it("should pass includeArchived false by default", async () => {
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetCategoriesQuery("workspace-123");
      await handler.execute(query);

      expect(categoryRepository.findByWorkspaceId).toHaveBeenCalledWith("workspace-123", false);
    });

    it("should filter by type when specified", async () => {
      const categories = [
        createTestCategory({ id: "cat-1", name: "Salary", type: "income" }),
        createTestCategory({ id: "cat-2", name: "Food", type: "expense" }),
        createTestCategory({ id: "cat-3", name: "Transport", type: "expense" }),
      ];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123", "expense");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result.every(c => c.type === "expense")).toBe(true);
    });

    it("should filter income categories", async () => {
      const categories = [
        createTestCategory({ id: "cat-1", name: "Salary", type: "income" }),
        createTestCategory({ id: "cat-2", name: "Bonus", type: "income" }),
        createTestCategory({ id: "cat-3", name: "Food", type: "expense" }),
      ];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123", "income");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result.every(c => c.type === "income")).toBe(true);
    });

    it("should return empty array when no categories exist", async () => {
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetCategoriesQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toEqual([]);
    });

    it("should return empty array when type filter matches nothing", async () => {
      const categories = [createTestCategory({ id: "cat-1", name: "Food", type: "expense" })];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123", "income");
      const result = await handler.execute(query);

      expect(result).toEqual([]);
    });

    it("should return all categories when type is not specified", async () => {
      const categories = [
        createTestCategory({ id: "cat-1", type: "income" }),
        createTestCategory({ id: "cat-2", type: "expense" }),
      ];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
    });

    it("should return toPrimitives for each category", async () => {
      const category = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food",
        type: "expense",
        icon: "utensils",
        color: "#FF0000",
        subcategories: [{ id: "sub-1", name: "Restaurants" }],
      });

      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetCategoriesQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result[0]).toEqual({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food",
        type: "expense",
        icon: "utensils",
        color: "#FF0000",
        subcategories: [{ id: "sub-1", name: "Restaurants", icon: undefined }],
        isArchived: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should include archived categories when includeArchived is true", async () => {
      const categories = [
        createTestCategory({ id: "cat-1", isArchived: false }),
        createTestCategory({ id: "cat-2", isArchived: true }),
      ];

      categoryRepository.findByWorkspaceId.mockResolvedValue(categories);

      const query = new GetCategoriesQuery("workspace-123", undefined, true);
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
    });
  });
});
