import { Test, TestingModule } from "@nestjs/testing";

import { CATEGORY_REPOSITORY, CategoryRepository } from "@/modules/categories/application/ports";
import { Category } from "@/modules/categories/domain/entities";

import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { GetExpensesBreakdownHandler } from "./get-expenses-breakdown.handler";
import { GetExpensesBreakdownQuery } from "./get-expenses-breakdown.query";

describe("GetExpensesBreakdownHandler", () => {
  let handler: GetExpensesBreakdownHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;

  beforeEach(async () => {
    const mockTransactionRepository: jest.Mocked<TransactionRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByCategory: jest.fn(),
      sumByCategory: jest.fn(),
      aggregateExpensesByMonth: jest.fn(),
    };

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
        GetExpensesBreakdownHandler,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    handler = module.get<GetExpensesBreakdownHandler>(GetExpensesBreakdownHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
    categoryRepository = module.get(CATEGORY_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestCategory = (overrides?: {
    id?: string;
    name?: string;
    color?: string;
    subcategories?: Array<{ id: string; name: string }>;
  }) =>
    Category.create({
      id: overrides?.id ?? "cat-123",
      workspaceId: "workspace-123",
      name: overrides?.name ?? "Food",
      type: "expense",
      color: overrides?.color ?? "#FF0000",
      subcategories: overrides?.subcategories?.map(s => ({ id: s.id, name: s.name })) ?? [],
    });

  describe("execute", () => {
    it("should return empty breakdown when no data", async () => {
      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result).toEqual({
        year: 2024,
        categories: [],
        monthlyTotals: [],
        grandTotal: 0,
      });
    });

    it("should pass correct parameters to repository", async () => {
      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024, "USD");
      await handler.execute(query);

      expect(transactionRepository.aggregateExpensesByMonth).toHaveBeenCalledWith(
        "workspace-123",
        2024,
        "USD",
      );
      expect(categoryRepository.findByWorkspaceId).toHaveBeenCalledWith("workspace-123");
    });

    it("should aggregate expenses by category", async () => {
      const category = createTestCategory({ id: "cat-1", name: "Food", color: "#FF0000" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: null, month: 2, total: 150 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].categoryId).toBe("cat-1");
      expect(result.categories[0].categoryName).toBe("Food");
      expect(result.categories[0].categoryColor).toBe("#FF0000");
      expect(result.categories[0].yearTotal).toBe(250);
    });

    it("should aggregate expenses by subcategory", async () => {
      const category = createTestCategory({
        id: "cat-1",
        name: "Food",
        subcategories: [
          { id: "sub-1", name: "Restaurants" },
          { id: "sub-2", name: "Groceries" },
        ],
      });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: "sub-1", month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: "sub-2", month: 1, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].subcategories).toHaveLength(2);
      expect(result.categories[0].subcategories[0].subcategoryName).toBe("Groceries");
      expect(result.categories[0].subcategories[0].yearTotal).toBe(200);
      expect(result.categories[0].subcategories[1].subcategoryName).toBe("Restaurants");
      expect(result.categories[0].subcategories[1].yearTotal).toBe(100);
    });

    it("should calculate monthly totals across categories", async () => {
      const category1 = createTestCategory({ id: "cat-1", name: "Food" });
      const category2 = createTestCategory({ id: "cat-2", name: "Transport" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-2", subcategoryId: null, month: 1, total: 50 },
        { categoryId: "cat-1", subcategoryId: null, month: 2, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category1, category2]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.monthlyTotals).toEqual([
        { month: 1, total: 150 },
        { month: 2, total: 200 },
      ]);
    });

    it("should calculate grand total", async () => {
      const category = createTestCategory({ id: "cat-1", name: "Food" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: null, month: 2, total: 200 },
        { categoryId: "cat-1", subcategoryId: null, month: 3, total: 300 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.grandTotal).toBe(600);
    });

    it("should skip deleted categories", async () => {
      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "deleted-cat", subcategoryId: null, month: 1, total: 100 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories).toHaveLength(0);
      expect(result.grandTotal).toBe(0);
    });

    it("should sort categories by name", async () => {
      const categoryZ = createTestCategory({ id: "cat-1", name: "Zebra" });
      const categoryA = createTestCategory({ id: "cat-2", name: "Apple" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-2", subcategoryId: null, month: 1, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([categoryZ, categoryA]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].categoryName).toBe("Apple");
      expect(result.categories[1].categoryName).toBe("Zebra");
    });

    it("should sort subcategories by name", async () => {
      const category = createTestCategory({
        id: "cat-1",
        name: "Food",
        subcategories: [
          { id: "sub-1", name: "Zebra" },
          { id: "sub-2", name: "Apple" },
        ],
      });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: "sub-1", month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: "sub-2", month: 1, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].subcategories[0].subcategoryName).toBe("Apple");
      expect(result.categories[0].subcategories[1].subcategoryName).toBe("Zebra");
    });

    it("should sort monthly totals by month", async () => {
      const category = createTestCategory({ id: "cat-1", name: "Food" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 12, total: 100 },
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 200 },
        { categoryId: "cat-1", subcategoryId: null, month: 6, total: 300 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.monthlyTotals).toEqual([
        { month: 1, total: 200 },
        { month: 6, total: 300 },
        { month: 12, total: 100 },
      ]);
    });

    it("should handle transactions without subcategory", async () => {
      const category = createTestCategory({
        id: "cat-1",
        name: "Food",
        subcategories: [{ id: "sub-1", name: "Restaurants" }],
      });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: "sub-1", month: 1, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].yearTotal).toBe(300);
      expect(result.categories[0].subcategories).toHaveLength(1);
      expect(result.categories[0].subcategories[0].yearTotal).toBe(200);
    });

    it("should return year from query", async () => {
      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2025);
      const result = await handler.execute(query);

      expect(result.year).toBe(2025);
    });

    it("should handle missing subcategory in category data", async () => {
      const category = createTestCategory({
        id: "cat-1",
        name: "Food",
        subcategories: [],
      });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: "deleted-sub", month: 1, total: 100 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].subcategories[0].subcategoryName).toBe("Sin subcategoría");
    });
  });
});
