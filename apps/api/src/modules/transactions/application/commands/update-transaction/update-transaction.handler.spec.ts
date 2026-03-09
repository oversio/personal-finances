import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

import { Transaction } from "../../../domain/entities";
import {
  CategoryRequiredError,
  SameAccountTransferError,
  TransactionNotFoundError,
  TransferRequiresToAccountError,
} from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { UpdateTransactionCommand } from "./update-transaction.command";
import { UpdateTransactionHandler } from "./update-transaction.handler";

describe("UpdateTransactionHandler", () => {
  let handler: UpdateTransactionHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

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

    const mockEventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionHandler,
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

    handler = module.get<UpdateTransactionHandler>(UpdateTransactionHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestTransaction = (overrides?: {
    id?: string;
    workspaceId?: string;
    type?: string;
    accountId?: string;
    toAccountId?: string;
    categoryId?: string;
    amount?: number;
  }) =>
    Transaction.create({
      id: overrides?.id ?? "tx-123",
      workspaceId: overrides?.workspaceId ?? "workspace-123",
      type: overrides?.type ?? "expense",
      accountId: overrides?.accountId ?? "account-123",
      toAccountId: overrides?.toAccountId,
      categoryId:
        overrides?.type === "transfer" ? undefined : (overrides?.categoryId ?? "category-123"),
      amount: overrides?.amount ?? 100,
      currency: "USD",
      date: new Date("2024-06-15"),
      createdBy: "user-123",
    });

  describe("execute", () => {
    it("should update transaction amount", async () => {
      const transaction = createTestTransaction();
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      const result = await handler.execute(command);

      expect(result.amount).toBe(200);
    });

    it("should update transaction notes", async () => {
      const transaction = createTestTransaction();
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "Updated notes",
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      const result = await handler.execute(command);

      expect(result.notes).toBe("Updated notes");
    });

    it("should clear notes with null", async () => {
      const transaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "expense",
        accountId: "account-123",
        categoryId: "category-123",
        amount: 100,
        currency: "USD",
        notes: "Original notes",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        null,
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      const result = await handler.execute(command);

      expect(result.notes).toBeUndefined();
    });

    it("should throw TransactionNotFoundError when transaction does not exist", async () => {
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(TransactionNotFoundError);
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw TransactionNotFoundError when transaction belongs to different workspace", async () => {
      const transaction = createTestTransaction({ workspaceId: "other-workspace" });
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(transaction);

      await expect(handler.execute(command)).rejects.toThrow(TransactionNotFoundError);
    });
  });

  describe("execute - type changes", () => {
    it("should update from expense to income", async () => {
      const transaction = createTestTransaction({ type: "expense" });
      const command = new UpdateTransactionCommand("tx-123", "workspace-123", "income");

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      const result = await handler.execute(command);

      expect(result.type).toBe("income");
    });

    it("should throw CategoryRequiredError when changing to income without category", async () => {
      const transaction = createTestTransaction({ type: "transfer", toAccountId: "account-456" });
      const command = new UpdateTransactionCommand("tx-123", "workspace-123", "income");

      transactionRepository.findById.mockResolvedValue(transaction);

      await expect(handler.execute(command)).rejects.toThrow(CategoryRequiredError);
    });

    it("should throw TransferRequiresToAccountError when changing to transfer without toAccountId", async () => {
      const transaction = createTestTransaction({ type: "expense" });
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        "transfer",
        undefined,
        undefined,
        null,
      );

      transactionRepository.findById.mockResolvedValue(transaction);

      await expect(handler.execute(command)).rejects.toThrow(TransferRequiresToAccountError);
    });

    it("should throw SameAccountTransferError when changing toAccountId to same as accountId", async () => {
      const transaction = createTestTransaction({ type: "transfer", toAccountId: "account-456" });
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        "account-123",
      );

      transactionRepository.findById.mockResolvedValue(transaction);

      await expect(handler.execute(command)).rejects.toThrow(SameAccountTransferError);
    });
  });

  describe("execute - event emission", () => {
    it("should emit transaction.updated event with old and new values", async () => {
      const transaction = createTestTransaction({
        type: "expense",
        accountId: "account-123",
        amount: 100,
      });
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        "account-456",
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      await handler.execute(command);

      expect(eventEmitter.emit).toHaveBeenCalledWith("transaction.updated", {
        transactionId: "tx-123",
        workspaceId: "workspace-123",
        oldType: "expense",
        oldAccountId: "account-123",
        oldToAccountId: undefined,
        oldAmount: 100,
        newType: "expense",
        newAccountId: "account-456",
        newToAccountId: undefined,
        newAmount: 200,
      });
    });

    it("should include toAccountId in event when updating transfer", async () => {
      const transaction = createTestTransaction({
        type: "transfer",
        toAccountId: "account-456",
      });
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        "account-789",
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      await handler.execute(command);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "transaction.updated",
        expect.objectContaining({
          oldToAccountId: "account-456",
          newToAccountId: "account-789",
        }),
      );
    });

    it("should not emit event when transaction not found", async () => {
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe("execute - return value", () => {
    it("should return toPrimitives result", async () => {
      const transaction = createTestTransaction();
      const command = new UpdateTransactionCommand(
        "tx-123",
        "workspace-123",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        200,
      );

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockImplementation(async tx => tx);

      const result = await handler.execute(command);

      expect(result.id).toBe("tx-123");
      expect(result.workspaceId).toBe("workspace-123");
      expect(result.amount).toBe(200);
    });
  });
});
