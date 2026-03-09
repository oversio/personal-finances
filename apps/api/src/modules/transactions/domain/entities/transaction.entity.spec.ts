import { ZodError } from "zod";

import {
  CategoryRequiredError,
  SameAccountTransferError,
  TransferRequiresToAccountError,
} from "../exceptions";
import { Transaction } from "./transaction.entity";

describe("Transaction", () => {
  const baseParams = {
    workspaceId: "workspace-123",
    accountId: "account-123",
    amount: 100,
    currency: "USD",
    date: new Date("2024-06-15"),
    createdBy: "user-123",
  };

  const incomeParams = {
    ...baseParams,
    type: "income",
    categoryId: "category-123",
  };

  const expenseParams = {
    ...baseParams,
    type: "expense",
    categoryId: "category-123",
  };

  const transferParams = {
    ...baseParams,
    type: "transfer",
    toAccountId: "account-456",
  };

  describe("create", () => {
    describe("income transactions", () => {
      it("should create an income transaction", () => {
        const transaction = Transaction.create(incomeParams);

        expect(transaction.type.value).toBe("income");
        expect(transaction.type.isIncome()).toBe(true);
        expect(transaction.categoryId?.value).toBe("category-123");
      });

      it("should throw CategoryRequiredError without categoryId", () => {
        const params = { ...baseParams, type: "income" };

        expect(() => Transaction.create(params)).toThrow(CategoryRequiredError);
      });

      it("should allow subcategoryId", () => {
        const transaction = Transaction.create({
          ...incomeParams,
          subcategoryId: "sub-123",
        });

        expect(transaction.subcategoryId).toBe("sub-123");
      });
    });

    describe("expense transactions", () => {
      it("should create an expense transaction", () => {
        const transaction = Transaction.create(expenseParams);

        expect(transaction.type.value).toBe("expense");
        expect(transaction.type.isExpense()).toBe(true);
        expect(transaction.categoryId?.value).toBe("category-123");
      });

      it("should throw CategoryRequiredError without categoryId", () => {
        const params = { ...baseParams, type: "expense" };

        expect(() => Transaction.create(params)).toThrow(CategoryRequiredError);
      });

      it("should include transaction type in error message", () => {
        const params = { ...baseParams, type: "expense" };

        try {
          Transaction.create(params);
          fail("Expected CategoryRequiredError to be thrown");
        } catch (error) {
          expect(error).toBeInstanceOf(CategoryRequiredError);
          expect((error as CategoryRequiredError).message).toContain("expense");
        }
      });
    });

    describe("transfer transactions", () => {
      it("should create a transfer transaction", () => {
        const transaction = Transaction.create(transferParams);

        expect(transaction.type.value).toBe("transfer");
        expect(transaction.type.isTransfer()).toBe(true);
        expect(transaction.toAccountId?.value).toBe("account-456");
      });

      it("should throw TransferRequiresToAccountError without toAccountId", () => {
        const params = { ...baseParams, type: "transfer" };

        expect(() => Transaction.create(params)).toThrow(TransferRequiresToAccountError);
      });

      it("should throw SameAccountTransferError when transferring to same account", () => {
        const params = {
          ...baseParams,
          type: "transfer",
          toAccountId: "account-123",
        };

        expect(() => Transaction.create(params)).toThrow(SameAccountTransferError);
      });

      it("should not require categoryId for transfers", () => {
        const transaction = Transaction.create(transferParams);

        expect(transaction.categoryId).toBeUndefined();
      });
    });

    describe("common fields", () => {
      it("should create transaction with optional id", () => {
        const transaction = Transaction.create({ ...incomeParams, id: "tx-123" });

        expect(transaction.id?.value).toBe("tx-123");
      });

      it("should default id to undefined", () => {
        const transaction = Transaction.create(incomeParams);

        expect(transaction.id).toBeUndefined();
      });

      it("should set amount", () => {
        const transaction = Transaction.create({ ...incomeParams, amount: 250.5 });

        expect(transaction.amount.value).toBe(250.5);
      });

      it("should set currency", () => {
        const transaction = Transaction.create({ ...incomeParams, currency: "EUR" });

        expect(transaction.currency.value).toBe("EUR");
      });

      it("should set date from Date object", () => {
        const date = new Date("2024-06-15");
        const transaction = Transaction.create({ ...incomeParams, date });

        expect(transaction.date.value).toEqual(date);
      });

      it("should set date from string", () => {
        const transaction = Transaction.create({ ...incomeParams, date: "2024-06-15" });

        expect(transaction.date.value).toBeInstanceOf(Date);
      });

      it("should trim notes", () => {
        const transaction = Transaction.create({ ...incomeParams, notes: "  Payment  " });

        expect(transaction.notes).toBe("Payment");
      });

      it("should default notes to undefined", () => {
        const transaction = Transaction.create(incomeParams);

        expect(transaction.notes).toBeUndefined();
      });

      it("should default isArchived to false", () => {
        const transaction = Transaction.create(incomeParams);

        expect(transaction.isArchived).toBe(false);
      });

      it("should set createdAt and updatedAt to current date by default", () => {
        const before = new Date();
        const transaction = Transaction.create(incomeParams);
        const after = new Date();

        expect(transaction.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(transaction.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });

    describe("validation", () => {
      it("should throw for invalid transaction type", () => {
        const params = { ...baseParams, type: "invalid" };

        expect(() => Transaction.create(params)).toThrow(ZodError);
      });

      it("should throw for zero amount", () => {
        expect(() => Transaction.create({ ...incomeParams, amount: 0 })).toThrow(ZodError);
      });

      it("should throw for negative amount", () => {
        expect(() => Transaction.create({ ...incomeParams, amount: -100 })).toThrow(ZodError);
      });

      it("should throw for empty workspaceId", () => {
        expect(() => Transaction.create({ ...incomeParams, workspaceId: "" })).toThrow(ZodError);
      });

      it("should throw for empty accountId", () => {
        expect(() => Transaction.create({ ...incomeParams, accountId: "" })).toThrow(ZodError);
      });
    });
  });

  describe("update", () => {
    describe("type changes", () => {
      it("should update type from income to expense", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ type: "expense" });

        expect(updated.type.value).toBe("expense");
      });

      it("should update type from expense to transfer", () => {
        const transaction = Transaction.create(expenseParams);
        const updated = transaction.update({
          type: "transfer",
          toAccountId: "account-456",
          categoryId: null,
        });

        expect(updated.type.value).toBe("transfer");
        expect(updated.toAccountId?.value).toBe("account-456");
        expect(updated.categoryId).toBeUndefined();
      });

      it("should throw when changing to transfer without toAccountId", () => {
        const transaction = Transaction.create(incomeParams);

        expect(() => transaction.update({ type: "transfer" })).toThrow(
          TransferRequiresToAccountError,
        );
      });

      it("should throw when changing to income/expense without categoryId", () => {
        const transaction = Transaction.create(transferParams);

        expect(() => transaction.update({ type: "income" })).toThrow(CategoryRequiredError);
      });
    });

    describe("clearing optional fields", () => {
      it("should clear toAccountId with null", () => {
        const transaction = Transaction.create(transferParams);
        const updated = transaction.update({
          type: "income",
          categoryId: "cat-123",
          toAccountId: null,
        });

        expect(updated.toAccountId).toBeUndefined();
      });

      it("should clear categoryId with null", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({
          type: "transfer",
          toAccountId: "account-456",
          categoryId: null,
        });

        expect(updated.categoryId).toBeUndefined();
      });

      it("should clear subcategoryId with null", () => {
        const transaction = Transaction.create({
          ...incomeParams,
          subcategoryId: "sub-123",
        });
        const updated = transaction.update({ subcategoryId: null });

        expect(updated.subcategoryId).toBeUndefined();
      });

      it("should clear notes with null", () => {
        const transaction = Transaction.create({ ...incomeParams, notes: "Test" });
        const updated = transaction.update({ notes: null });

        expect(updated.notes).toBeUndefined();
      });
    });

    describe("field updates", () => {
      it("should update amount", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ amount: 200 });

        expect(updated.amount.value).toBe(200);
      });

      it("should update notes", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ notes: "Updated notes" });

        expect(updated.notes).toBe("Updated notes");
      });

      it("should trim updated notes", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ notes: "  Trimmed  " });

        expect(updated.notes).toBe("Trimmed");
      });

      it("should update date", () => {
        const transaction = Transaction.create(incomeParams);
        const newDate = new Date("2024-07-01");
        const updated = transaction.update({ date: newDate });

        expect(updated.date.value).toEqual(newDate);
      });

      it("should update accountId", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ accountId: "new-account" });

        expect(updated.accountId.value).toBe("new-account");
      });
    });

    describe("validation", () => {
      it("should throw SameAccountTransferError when updating toAccountId to same as accountId", () => {
        const transaction = Transaction.create(transferParams);

        expect(() => transaction.update({ toAccountId: "account-123" })).toThrow(
          SameAccountTransferError,
        );
      });

      it("should throw SameAccountTransferError when updating accountId to same as toAccountId", () => {
        const transaction = Transaction.create(transferParams);

        expect(() => transaction.update({ accountId: "account-456" })).toThrow(
          SameAccountTransferError,
        );
      });

      it("should validate new amount", () => {
        const transaction = Transaction.create(incomeParams);

        expect(() => transaction.update({ amount: -50 })).toThrow(ZodError);
      });
    });

    describe("immutability and timestamps", () => {
      it("should update updatedAt", () => {
        const oldDate = new Date("2024-01-01");
        const transaction = Transaction.create({ ...incomeParams, updatedAt: oldDate });

        const before = new Date();
        const updated = transaction.update({ amount: 200 });

        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      });

      it("should return new instance (immutability)", () => {
        const transaction = Transaction.create(incomeParams);
        const updated = transaction.update({ amount: 200 });

        expect(updated).not.toBe(transaction);
        expect(transaction.amount.value).toBe(100);
      });

      it("should preserve fields not being updated", () => {
        const transaction = Transaction.create({
          ...incomeParams,
          notes: "Original notes",
          subcategoryId: "sub-123",
        });
        const updated = transaction.update({ amount: 200 });

        expect(updated.notes).toBe("Original notes");
        expect(updated.subcategoryId).toBe("sub-123");
        expect(updated.categoryId?.value).toBe("category-123");
      });
    });
  });

  describe("archive", () => {
    it("should return new transaction with isArchived true", () => {
      const transaction = Transaction.create(incomeParams);
      const archived = transaction.archive();

      expect(archived.isArchived).toBe(true);
      expect(transaction.isArchived).toBe(false);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const transaction = Transaction.create({ ...incomeParams, updatedAt: oldDate });

      const before = new Date();
      const archived = transaction.archive();

      expect(archived.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should preserve all other fields", () => {
      const transaction = Transaction.create({
        ...incomeParams,
        id: "tx-123",
        notes: "Test",
        subcategoryId: "sub-123",
      });
      const archived = transaction.archive();

      expect(archived.id?.value).toBe("tx-123");
      expect(archived.amount.value).toBe(100);
      expect(archived.notes).toBe("Test");
      expect(archived.subcategoryId).toBe("sub-123");
    });

    it("should return new instance (immutability)", () => {
      const transaction = Transaction.create(incomeParams);
      const archived = transaction.archive();

      expect(archived).not.toBe(transaction);
    });
  });

  describe("toPrimitives", () => {
    it("should serialize income transaction", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const date = new Date("2024-06-15");

      const transaction = Transaction.create({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 100,
        currency: "USD",
        notes: "Salary",
        date,
        createdBy: "user-123",
        isArchived: false,
        createdAt,
        updatedAt,
      });

      const primitives = transaction.toPrimitives();

      expect(primitives).toEqual({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        toAccountId: undefined,
        categoryId: "category-123",
        subcategoryId: "sub-123",
        amount: 100,
        currency: "USD",
        notes: "Salary",
        date,
        createdBy: "user-123",
        isArchived: false,
        createdAt,
        updatedAt,
      });
    });

    it("should serialize transfer transaction", () => {
      const transaction = Transaction.create({
        ...transferParams,
        id: "tx-456",
      });

      const primitives = transaction.toPrimitives();

      expect(primitives.type).toBe("transfer");
      expect(primitives.toAccountId).toBe("account-456");
      expect(primitives.categoryId).toBeUndefined();
    });

    it("should serialize undefined fields correctly", () => {
      const transaction = Transaction.create(incomeParams);
      const primitives = transaction.toPrimitives();

      expect(primitives.id).toBeUndefined();
      expect(primitives.toAccountId).toBeUndefined();
      expect(primitives.subcategoryId).toBeUndefined();
      expect(primitives.notes).toBeUndefined();
    });
  });
});
