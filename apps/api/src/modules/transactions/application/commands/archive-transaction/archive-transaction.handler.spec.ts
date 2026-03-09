import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

import { Transaction } from "../../../domain/entities";
import { TransactionNotFoundError } from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { ArchiveTransactionCommand } from "./archive-transaction.command";
import { ArchiveTransactionHandler } from "./archive-transaction.handler";

describe("ArchiveTransactionHandler", () => {
  let handler: ArchiveTransactionHandler;
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
        ArchiveTransactionHandler,
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

    handler = module.get<ArchiveTransactionHandler>(ArchiveTransactionHandler);
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
    isArchived?: boolean;
    toAccountId?: string;
  }) =>
    Transaction.create({
      id: overrides?.id ?? "tx-123",
      workspaceId: overrides?.workspaceId ?? "workspace-123",
      type: overrides?.type ?? "expense",
      accountId: "account-123",
      toAccountId: overrides?.toAccountId,
      categoryId: overrides?.type === "transfer" ? undefined : "category-123",
      amount: 100,
      currency: "USD",
      date: new Date("2024-06-15"),
      createdBy: "user-123",
      isArchived: overrides?.isArchived ?? false,
    });

  describe("execute", () => {
    const validCommand = new ArchiveTransactionCommand("tx-123", "workspace-123");

    it("should archive transaction successfully", async () => {
      const transaction = createTestTransaction();

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockResolvedValue(transaction.archive());

      await handler.execute(validCommand);

      expect(transactionRepository.update).toHaveBeenCalledTimes(1);
      const updatedTransaction = transactionRepository.update.mock.calls[0][0];
      expect(updatedTransaction.isArchived).toBe(true);
    });

    it("should throw TransactionNotFoundError when transaction does not exist", async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(validCommand)).rejects.toThrow(TransactionNotFoundError);
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw TransactionNotFoundError when transaction belongs to different workspace", async () => {
      const transactionInDifferentWorkspace = createTestTransaction({
        workspaceId: "other-workspace",
      });

      transactionRepository.findById.mockResolvedValue(transactionInDifferentWorkspace);

      await expect(handler.execute(validCommand)).rejects.toThrow(TransactionNotFoundError);
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it("should return early if transaction is already archived", async () => {
      const alreadyArchivedTransaction = createTestTransaction({ isArchived: true });

      transactionRepository.findById.mockResolvedValue(alreadyArchivedTransaction);

      await handler.execute(validCommand);

      expect(transactionRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it("should call findById with correct id", async () => {
      const transaction = createTestTransaction();

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockResolvedValue(transaction.archive());

      await handler.execute(validCommand);

      expect(transactionRepository.findById).toHaveBeenCalledWith("tx-123");
    });

    it("should return void on success", async () => {
      const transaction = createTestTransaction();

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockResolvedValue(transaction.archive());

      const result = await handler.execute(validCommand);

      expect(result).toBeUndefined();
    });
  });

  describe("execute - event emission", () => {
    it("should emit transaction.archived event for expense", async () => {
      const transaction = createTestTransaction({ type: "expense" });

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockResolvedValue(transaction.archive());

      await handler.execute(new ArchiveTransactionCommand("tx-123", "workspace-123"));

      expect(eventEmitter.emit).toHaveBeenCalledWith("transaction.archived", {
        transactionId: "tx-123",
        workspaceId: "workspace-123",
        type: "expense",
        accountId: "account-123",
        toAccountId: undefined,
        amount: 100,
      });
    });

    it("should emit transaction.archived event for transfer with toAccountId", async () => {
      const transaction = createTestTransaction({
        type: "transfer",
        toAccountId: "account-456",
      });

      transactionRepository.findById.mockResolvedValue(transaction);
      transactionRepository.update.mockResolvedValue(transaction.archive());

      await handler.execute(new ArchiveTransactionCommand("tx-123", "workspace-123"));

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "transaction.archived",
        expect.objectContaining({
          type: "transfer",
          toAccountId: "account-456",
        }),
      );
    });

    it("should not emit event when transaction not found", async () => {
      transactionRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new ArchiveTransactionCommand("tx-123", "workspace-123")),
      ).rejects.toThrow();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it("should not emit event when already archived", async () => {
      const alreadyArchivedTransaction = createTestTransaction({ isArchived: true });

      transactionRepository.findById.mockResolvedValue(alreadyArchivedTransaction);

      await handler.execute(new ArchiveTransactionCommand("tx-123", "workspace-123"));

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
