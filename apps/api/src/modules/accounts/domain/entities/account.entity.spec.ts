import { ZodError } from "zod";

import { Money } from "../value-objects";
import { Account } from "./account.entity";

describe("Account", () => {
  const validParams = {
    workspaceId: "workspace-123",
    name: "Checking Account",
    type: "checking",
    currency: "USD",
    initialBalance: 1000,
  };

  describe("create", () => {
    it("should create an account with required fields", () => {
      const account = Account.create(validParams);

      expect(account.workspaceId.value).toBe("workspace-123");
      expect(account.name.value).toBe("Checking Account");
      expect(account.type.value).toBe("checking");
      expect(account.currency.value).toBe("USD");
      expect(account.initialBalance.value).toBe(1000);
      expect(account.id).toBeUndefined();
    });

    it("should create an account with optional id", () => {
      const account = Account.create({ ...validParams, id: "acc-123" });

      expect(account.id?.value).toBe("acc-123");
    });

    it("should default currentBalance to initialBalance", () => {
      const account = Account.create(validParams);

      expect(account.currentBalance.value).toBe(1000);
      expect(account.currentBalance.equals(account.initialBalance)).toBe(true);
    });

    it("should set currentBalance when provided", () => {
      const account = Account.create({ ...validParams, currentBalance: 1500 });

      expect(account.currentBalance.value).toBe(1500);
      expect(account.initialBalance.value).toBe(1000);
    });

    it("should default color to HexColor.default()", () => {
      const account = Account.create(validParams);

      expect(account.color.value).toBe("#6366F1");
    });

    it("should set custom color when provided", () => {
      const account = Account.create({ ...validParams, color: "#FF5733" });

      expect(account.color.value).toBe("#FF5733");
    });

    it("should default icon to undefined", () => {
      const account = Account.create(validParams);

      expect(account.icon).toBeUndefined();
    });

    it("should set icon when provided", () => {
      const account = Account.create({ ...validParams, icon: "bank" });

      expect(account.icon).toBe("bank");
    });

    it("should default isArchived to false", () => {
      const account = Account.create(validParams);

      expect(account.isArchived).toBe(false);
    });

    it("should set isArchived when provided", () => {
      const account = Account.create({ ...validParams, isArchived: true });

      expect(account.isArchived).toBe(true);
    });

    it("should set createdAt and updatedAt to current date by default", () => {
      const before = new Date();
      const account = Account.create(validParams);
      const after = new Date();

      expect(account.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(account.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should use provided dates", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const account = Account.create({ ...validParams, createdAt, updatedAt });

      expect(account.createdAt).toBe(createdAt);
      expect(account.updatedAt).toBe(updatedAt);
    });

    it("should accept different account types", () => {
      const types = ["checking", "savings", "credit_card", "cash", "investment"];

      for (const type of types) {
        const account = Account.create({ ...validParams, type });
        expect(account.type.value).toBe(type);
      }
    });

    it("should accept zero initial balance", () => {
      const account = Account.create({ ...validParams, initialBalance: 0 });

      expect(account.initialBalance.value).toBe(0);
      expect(account.initialBalance.isZero()).toBe(true);
    });

    it("should accept negative initial balance", () => {
      const account = Account.create({ ...validParams, initialBalance: -500 });

      expect(account.initialBalance.value).toBe(-500);
      expect(account.initialBalance.isNegative()).toBe(true);
    });

    describe("validation", () => {
      it("should throw for empty name", () => {
        expect(() => Account.create({ ...validParams, name: "" })).toThrow(ZodError);
      });

      it("should throw for invalid account type", () => {
        expect(() => Account.create({ ...validParams, type: "invalid" })).toThrow(ZodError);
      });

      it("should throw for invalid color format", () => {
        expect(() => Account.create({ ...validParams, color: "blue" })).toThrow(ZodError);
      });

      it("should throw for empty workspaceId", () => {
        expect(() => Account.create({ ...validParams, workspaceId: "" })).toThrow(ZodError);
      });

      it("should throw for Infinity balance", () => {
        expect(() => Account.create({ ...validParams, initialBalance: Infinity })).toThrow(
          ZodError,
        );
      });

      it("should throw for NaN balance", () => {
        expect(() => Account.create({ ...validParams, initialBalance: NaN })).toThrow(ZodError);
      });
    });
  });

  describe("archive", () => {
    it("should return new account with isArchived true", () => {
      const account = Account.create(validParams);
      const archived = account.archive();

      expect(archived.isArchived).toBe(true);
      expect(account.isArchived).toBe(false);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const account = Account.create({ ...validParams, updatedAt: oldDate });

      const before = new Date();
      const archived = account.archive();

      expect(archived.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should preserve balance", () => {
      const account = Account.create({ ...validParams, currentBalance: 2000 });
      const archived = account.archive();

      expect(archived.initialBalance.value).toBe(1000);
      expect(archived.currentBalance.value).toBe(2000);
    });

    it("should preserve all other fields", () => {
      const account = Account.create({
        ...validParams,
        id: "acc-123",
        icon: "bank",
        color: "#FF0000",
      });
      const archived = account.archive();

      expect(archived.id?.value).toBe("acc-123");
      expect(archived.name.value).toBe("Checking Account");
      expect(archived.icon).toBe("bank");
      expect(archived.color.value).toBe("#FF0000");
    });

    it("should return new instance (immutability)", () => {
      const account = Account.create(validParams);
      const archived = account.archive();

      expect(archived).not.toBe(account);
    });
  });

  describe("updateBalance", () => {
    it("should update currentBalance", () => {
      const account = Account.create(validParams);
      const newBalance = new Money(2000);
      const updated = account.updateBalance(newBalance);

      expect(updated.currentBalance.value).toBe(2000);
    });

    it("should preserve initialBalance", () => {
      const account = Account.create(validParams);
      const newBalance = new Money(2000);
      const updated = account.updateBalance(newBalance);

      expect(updated.initialBalance.value).toBe(1000);
    });

    it("should allow negative balance", () => {
      const account = Account.create(validParams);
      const newBalance = new Money(-500);
      const updated = account.updateBalance(newBalance);

      expect(updated.currentBalance.value).toBe(-500);
      expect(updated.currentBalance.isNegative()).toBe(true);
    });

    it("should allow zero balance", () => {
      const account = Account.create(validParams);
      const newBalance = Money.zero();
      const updated = account.updateBalance(newBalance);

      expect(updated.currentBalance.value).toBe(0);
      expect(updated.currentBalance.isZero()).toBe(true);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const account = Account.create({ ...validParams, updatedAt: oldDate });

      const before = new Date();
      const updated = account.updateBalance(new Money(2000));

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should return new instance (immutability)", () => {
      const account = Account.create(validParams);
      const updated = account.updateBalance(new Money(2000));

      expect(updated).not.toBe(account);
      expect(account.currentBalance.value).toBe(1000);
    });
  });

  describe("update", () => {
    it("should update name", () => {
      const account = Account.create(validParams);
      const updated = account.update({ name: "New Name" });

      expect(updated.name.value).toBe("New Name");
      expect(account.name.value).toBe("Checking Account");
    });

    it("should update type", () => {
      const account = Account.create(validParams);
      const updated = account.update({ type: "savings" });

      expect(updated.type.value).toBe("savings");
    });

    it("should update color", () => {
      const account = Account.create(validParams);
      const updated = account.update({ color: "#00FF00" });

      expect(updated.color.value).toBe("#00FF00");
    });

    it("should update icon", () => {
      const account = Account.create(validParams);
      const updated = account.update({ icon: "wallet" });

      expect(updated.icon).toBe("wallet");
    });

    it("should allow clearing icon with empty string", () => {
      const account = Account.create({ ...validParams, icon: "bank" });
      const updated = account.update({ icon: "" });

      expect(updated.icon).toBe("");
    });

    it("should update multiple fields at once", () => {
      const account = Account.create(validParams);
      const updated = account.update({
        name: "Savings",
        type: "savings",
        color: "#AABBCC",
        icon: "piggy-bank",
      });

      expect(updated.name.value).toBe("Savings");
      expect(updated.type.value).toBe("savings");
      expect(updated.color.value).toBe("#AABBCC");
      expect(updated.icon).toBe("piggy-bank");
    });

    it("should preserve fields not being updated", () => {
      const account = Account.create({
        ...validParams,
        icon: "bank",
        color: "#FF0000",
      });
      const updated = account.update({ name: "New Name" });

      expect(updated.icon).toBe("bank");
      expect(updated.color.value).toBe("#FF0000");
      expect(updated.type.value).toBe("checking");
    });

    it("should NOT update balance", () => {
      const account = Account.create({ ...validParams, currentBalance: 2000 });
      const updated = account.update({ name: "New Name" });

      expect(updated.initialBalance.value).toBe(1000);
      expect(updated.currentBalance.value).toBe(2000);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const account = Account.create({ ...validParams, updatedAt: oldDate });

      const before = new Date();
      const updated = account.update({ name: "New Name" });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should return new instance (immutability)", () => {
      const account = Account.create(validParams);
      const updated = account.update({ name: "New Name" });

      expect(updated).not.toBe(account);
    });

    it("should keep existing name when empty string is passed (falsy check)", () => {
      const account = Account.create(validParams);
      const updated = account.update({ name: "" });

      expect(updated.name.value).toBe("Checking Account");
    });

    it("should validate new type", () => {
      const account = Account.create(validParams);

      expect(() => account.update({ type: "invalid" })).toThrow(ZodError);
    });
  });

  describe("toPrimitives", () => {
    it("should serialize all fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const account = Account.create({
        id: "acc-123",
        workspaceId: "workspace-123",
        name: "Checking",
        type: "checking",
        currency: "USD",
        initialBalance: 1000,
        currentBalance: 1500,
        color: "#FF0000",
        icon: "bank",
        isArchived: false,
        createdAt,
        updatedAt,
      });

      const primitives = account.toPrimitives();

      expect(primitives).toEqual({
        id: "acc-123",
        workspaceId: "workspace-123",
        name: "Checking",
        type: "checking",
        currency: "USD",
        initialBalance: 1000,
        currentBalance: 1500,
        color: "#FF0000",
        icon: "bank",
        isArchived: false,
        createdAt,
        updatedAt,
      });
    });

    it("should serialize undefined id as undefined", () => {
      const account = Account.create(validParams);
      const primitives = account.toPrimitives();

      expect(primitives.id).toBeUndefined();
    });

    it("should serialize undefined icon as undefined", () => {
      const account = Account.create(validParams);
      const primitives = account.toPrimitives();

      expect(primitives.icon).toBeUndefined();
    });
  });
});
