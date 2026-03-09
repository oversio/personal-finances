import { Test, TestingModule } from "@nestjs/testing";

import { Transaction } from "../../../domain/entities";
import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { GetTransactionsHandler } from "./get-transactions.handler";
import { GetTransactionsQuery } from "./get-transactions.query";

describe("GetTransactionsHandler", () => {
  let handler: GetTransactionsHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsHandler,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    handler = module.get<GetTransactionsHandler>(GetTransactionsHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestTransaction = (overrides?: {
    id?: string;
    type?: string;
    accountId?: string;
    categoryId?: string;
  }) =>
    Transaction.create({
      id: overrides?.id ?? "tx-123",
      workspaceId: "workspace-123",
      type: overrides?.type ?? "expense",
      accountId: overrides?.accountId ?? "account-123",
      categoryId:
        overrides?.type === "transfer" ? undefined : (overrides?.categoryId ?? "category-123"),
      toAccountId: overrides?.type === "transfer" ? "account-456" : undefined,
      amount: 100,
      currency: "USD",
      date: new Date("2024-06-15"),
      createdBy: "user-123",
    });

  describe("execute", () => {
    it("should return transactions for workspace", async () => {
      const transactions = [
        createTestTransaction({ id: "tx-1" }),
        createTestTransaction({ id: "tx-2" }),
      ];

      transactionRepository.findByWorkspaceId.mockResolvedValue(transactions);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("tx-1");
      expect(result[1].id).toBe("tx-2");
    });

    it("should pass all filters to repository", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery(
        "workspace-123",
        "account-123",
        "category-123",
        "sub-123",
        "expense",
        startDate,
        endDate,
        true,
      );

      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith("workspace-123", {
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: "sub-123",
        type: "expense",
        startDate,
        endDate,
        includeArchived: true,
      });
    });

    it("should pass includeArchived false by default", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery("workspace-123");
      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith(
        "workspace-123",
        expect.objectContaining({
          includeArchived: false,
        }),
      );
    });

    it("should return empty array when no transactions exist", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toEqual([]);
    });

    it("should filter by accountId", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery("workspace-123", "account-123");
      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith(
        "workspace-123",
        expect.objectContaining({
          accountId: "account-123",
        }),
      );
    });

    it("should filter by categoryId", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery("workspace-123", undefined, "category-123");
      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith(
        "workspace-123",
        expect.objectContaining({
          categoryId: "category-123",
        }),
      );
    });

    it("should filter by type", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery(
        "workspace-123",
        undefined,
        undefined,
        undefined,
        "income",
      );
      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith(
        "workspace-123",
        expect.objectContaining({
          type: "income",
        }),
      );
    });

    it("should filter by date range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-06-30");

      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery(
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        startDate,
        endDate,
      );
      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith(
        "workspace-123",
        expect.objectContaining({
          startDate,
          endDate,
        }),
      );
    });

    it("should return toPrimitives for each transaction", async () => {
      const date = new Date("2024-06-15");
      const transaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "expense",
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 150.5,
        currency: "USD",
        notes: "Lunch",
        date,
        createdBy: "user-123",
      });

      transactionRepository.findByWorkspaceId.mockResolvedValue([transaction]);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result[0]).toEqual({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "expense",
        accountId: "account-123",
        toAccountId: undefined,
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 150.5,
        currency: "USD",
        notes: "Lunch",
        date,
        createdBy: "user-123",
        isArchived: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should handle transfer transactions", async () => {
      const transaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "transfer",
        accountId: "account-123",
        toAccountId: "account-456",
        amount: 500,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.findByWorkspaceId.mockResolvedValue([transaction]);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result[0].type).toBe("transfer");
      expect(result[0].toAccountId).toBe("account-456");
      expect(result[0].categoryId).toBeUndefined();
    });
  });
});
