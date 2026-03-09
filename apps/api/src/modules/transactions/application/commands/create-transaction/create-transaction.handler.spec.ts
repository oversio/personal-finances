import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";

import { Transaction } from "../../../domain/entities";
import {
  CategoryRequiredError,
  SameAccountTransferError,
  TransferRequiresToAccountError,
} from "../../../domain/exceptions";
import { TRANSACTION_REPOSITORY, TransactionRepository } from "../../ports";
import { CreateTransactionCommand } from "./create-transaction.command";
import { CreateTransactionHandler } from "./create-transaction.handler";

describe("CreateTransactionHandler", () => {
  let handler: CreateTransactionHandler;
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
        CreateTransactionHandler,
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

    handler = module.get<CreateTransactionHandler>(CreateTransactionHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseCommandParams = {
    workspaceId: "workspace-123",
    accountId: "account-123",
    amount: 100,
    currency: "USD",
    date: new Date("2024-06-15"),
    createdBy: "user-123",
  };

  describe("execute - income transactions", () => {
    it("should create an income transaction", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        undefined,
        "category-123",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      const result = await handler.execute(command);

      expect(result.type).toBe("income");
      expect(result.categoryId).toBe("category-123");
    });

    it("should throw CategoryRequiredError for income without categoryId", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
      );

      await expect(handler.execute(command)).rejects.toThrow(CategoryRequiredError);
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("execute - expense transactions", () => {
    it("should create an expense transaction", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "expense",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        undefined,
        "category-123",
        "sub-123",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "expense",
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      const result = await handler.execute(command);

      expect(result.type).toBe("expense");
      expect(result.subcategoryId).toBe("sub-123");
    });

    it("should throw CategoryRequiredError for expense without categoryId", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "expense",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
      );

      await expect(handler.execute(command)).rejects.toThrow(CategoryRequiredError);
    });
  });

  describe("execute - transfer transactions", () => {
    it("should create a transfer transaction", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "transfer",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        "account-456",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "transfer",
        accountId: "account-123",
        toAccountId: "account-456",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      const result = await handler.execute(command);

      expect(result.type).toBe("transfer");
      expect(result.toAccountId).toBe("account-456");
    });

    it("should throw TransferRequiresToAccountError for transfer without toAccountId", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "transfer",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
      );

      await expect(handler.execute(command)).rejects.toThrow(TransferRequiresToAccountError);
    });

    it("should throw SameAccountTransferError when transferring to same account", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "transfer",
        "account-123",
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        "account-123",
      );

      await expect(handler.execute(command)).rejects.toThrow(SameAccountTransferError);
    });
  });

  describe("execute - repository interaction", () => {
    it("should save transaction to repository", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        undefined,
        "category-123",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      await handler.execute(command);

      expect(transactionRepository.save).toHaveBeenCalledTimes(1);
      const savedArg = transactionRepository.save.mock.calls[0][0];
      expect(savedArg).toBeInstanceOf(Transaction);
      expect(savedArg.workspaceId.value).toBe("workspace-123");
    });
  });

  describe("execute - event emission", () => {
    it("should emit transaction.created event for income", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        undefined,
        "category-123",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      await handler.execute(command);

      expect(eventEmitter.emit).toHaveBeenCalledWith("transaction.created", {
        transactionId: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        toAccountId: undefined,
        amount: 100,
      });
    });

    it("should emit transaction.created event for transfer with toAccountId", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "transfer",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
        "account-456",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "transfer",
        accountId: "account-123",
        toAccountId: "account-456",
        amount: 100,
        currency: "USD",
        date: new Date("2024-06-15"),
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      await handler.execute(command);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "transaction.created",
        expect.objectContaining({
          toAccountId: "account-456",
        }),
      );
    });

    it("should not emit event when validation fails", async () => {
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        baseCommandParams.amount,
        baseCommandParams.currency,
        baseCommandParams.date,
        baseCommandParams.createdBy,
      );

      await expect(handler.execute(command)).rejects.toThrow();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe("execute - return value", () => {
    it("should return toPrimitives result", async () => {
      const date = new Date("2024-06-15");
      const command = new CreateTransactionCommand(
        baseCommandParams.workspaceId,
        "income",
        baseCommandParams.accountId,
        250.5,
        "EUR",
        date,
        baseCommandParams.createdBy,
        undefined,
        "category-123",
        "sub-123",
        "Payment received",
      );

      const savedTransaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 250.5,
        currency: "EUR",
        notes: "Payment received",
        date,
        createdBy: "user-123",
      });

      transactionRepository.save.mockResolvedValue(savedTransaction);

      const result = await handler.execute(command);

      expect(result.id).toBe("tx-123");
      expect(result.amount).toBe(250.5);
      expect(result.currency).toBe("EUR");
      expect(result.notes).toBe("Payment received");
      expect(result.subcategoryId).toBe("sub-123");
    });
  });
});
