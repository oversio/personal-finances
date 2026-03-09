import { Test, TestingModule } from "@nestjs/testing";

import { Transaction } from "../../../domain/entities";
import { TransactionNotFoundError } from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { GetTransactionHandler } from "./get-transaction.handler";
import { GetTransactionQuery } from "./get-transaction.query";

describe("GetTransactionHandler", () => {
  let handler: GetTransactionHandler;
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
        GetTransactionHandler,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    handler = module.get<GetTransactionHandler>(GetTransactionHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestTransaction = (overrides?: {
    id?: string;
    workspaceId?: string;
    type?: string;
  }) =>
    Transaction.create({
      id: overrides?.id ?? "tx-123",
      workspaceId: overrides?.workspaceId ?? "workspace-123",
      type: overrides?.type ?? "expense",
      accountId: "account-123",
      categoryId: overrides?.type === "transfer" ? undefined : "category-123",
      toAccountId: overrides?.type === "transfer" ? "account-456" : undefined,
      amount: 100,
      currency: "USD",
      date: new Date("2024-06-15"),
      createdBy: "user-123",
    });

  describe("execute", () => {
    it("should return transaction by id", async () => {
      const transaction = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");
      const result = await handler.execute(query);

      expect(result.id).toBe("tx-123");
      expect(result.workspaceId).toBe("workspace-123");
    });

    it("should call repository with correct id", async () => {
      const transaction = createTestTransaction();
      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");
      await handler.execute(query);

      expect(transactionRepository.findById).toHaveBeenCalledWith("tx-123");
    });

    it("should throw TransactionNotFoundError when transaction does not exist", async () => {
      transactionRepository.findById.mockResolvedValue(null);

      const query = new GetTransactionQuery("tx-123", "workspace-123");

      await expect(handler.execute(query)).rejects.toThrow(TransactionNotFoundError);
    });

    it("should throw TransactionNotFoundError when transaction belongs to different workspace", async () => {
      const transaction = createTestTransaction({ workspaceId: "other-workspace" });
      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");

      await expect(handler.execute(query)).rejects.toThrow(TransactionNotFoundError);
    });

    it("should return toPrimitives result", async () => {
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

      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");
      const result = await handler.execute(query);

      expect(result).toEqual({
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

    it("should return transfer transaction with toAccountId", async () => {
      const transaction = createTestTransaction({ type: "transfer" });
      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");
      const result = await handler.execute(query);

      expect(result.type).toBe("transfer");
      expect(result.toAccountId).toBe("account-456");
      expect(result.categoryId).toBeUndefined();
    });

    it("should return income transaction", async () => {
      const transaction = createTestTransaction({ type: "income" });
      transactionRepository.findById.mockResolvedValue(transaction);

      const query = new GetTransactionQuery("tx-123", "workspace-123");
      const result = await handler.execute(query);

      expect(result.type).toBe("income");
    });
  });
});
