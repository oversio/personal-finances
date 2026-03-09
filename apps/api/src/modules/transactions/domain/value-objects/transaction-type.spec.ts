import { ZodError } from "zod";

import { TRANSACTION_TYPES, TransactionType } from "./transaction-type";

describe("TransactionType", () => {
  describe("construction", () => {
    it("should create TransactionType with 'income'", () => {
      const type = new TransactionType("income");

      expect(type.value).toBe("income");
    });

    it("should create TransactionType with 'expense'", () => {
      const type = new TransactionType("expense");

      expect(type.value).toBe("expense");
    });

    it("should create TransactionType with 'transfer'", () => {
      const type = new TransactionType("transfer");

      expect(type.value).toBe("transfer");
    });
  });

  describe("validation", () => {
    it("should throw ZodError for invalid type", () => {
      expect(() => new TransactionType("invalid")).toThrow(ZodError);
    });

    it("should throw ZodError for empty string", () => {
      expect(() => new TransactionType("")).toThrow(ZodError);
    });

    it("should throw with correct error message", () => {
      try {
        new TransactionType("invalid");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe(
          "Invalid transaction type. Must be income, expense, or transfer",
        );
      }
    });

    it("should be case-sensitive (reject uppercase)", () => {
      expect(() => new TransactionType("INCOME")).toThrow(ZodError);
      expect(() => new TransactionType("Income")).toThrow(ZodError);
    });
  });

  describe("type guard methods", () => {
    describe("isIncome", () => {
      it("should return true for income type", () => {
        expect(new TransactionType("income").isIncome()).toBe(true);
      });

      it("should return false for other types", () => {
        expect(new TransactionType("expense").isIncome()).toBe(false);
        expect(new TransactionType("transfer").isIncome()).toBe(false);
      });
    });

    describe("isExpense", () => {
      it("should return true for expense type", () => {
        expect(new TransactionType("expense").isExpense()).toBe(true);
      });

      it("should return false for other types", () => {
        expect(new TransactionType("income").isExpense()).toBe(false);
        expect(new TransactionType("transfer").isExpense()).toBe(false);
      });
    });

    describe("isTransfer", () => {
      it("should return true for transfer type", () => {
        expect(new TransactionType("transfer").isTransfer()).toBe(true);
      });

      it("should return false for other types", () => {
        expect(new TransactionType("income").isTransfer()).toBe(false);
        expect(new TransactionType("expense").isTransfer()).toBe(false);
      });
    });
  });

  describe("business logic methods", () => {
    describe("requiresCategory", () => {
      it("should return true for income", () => {
        expect(new TransactionType("income").requiresCategory()).toBe(true);
      });

      it("should return true for expense", () => {
        expect(new TransactionType("expense").requiresCategory()).toBe(true);
      });

      it("should return false for transfer", () => {
        expect(new TransactionType("transfer").requiresCategory()).toBe(false);
      });
    });

    describe("requiresDestinationAccount", () => {
      it("should return true for transfer", () => {
        expect(new TransactionType("transfer").requiresDestinationAccount()).toBe(true);
      });

      it("should return false for income", () => {
        expect(new TransactionType("income").requiresDestinationAccount()).toBe(false);
      });

      it("should return false for expense", () => {
        expect(new TransactionType("expense").requiresDestinationAccount()).toBe(false);
      });
    });
  });

  describe("static values", () => {
    it("should return all valid transaction types", () => {
      const values = TransactionType.values();

      expect(values).toEqual(["income", "expense", "transfer"]);
    });

    it("should return readonly array", () => {
      const values = TransactionType.values();

      expect(values).toBe(TRANSACTION_TYPES);
    });

    it("should contain exactly 3 types", () => {
      expect(TransactionType.values()).toHaveLength(3);
    });
  });

  describe("equals", () => {
    it("should return true for same type", () => {
      const type1 = new TransactionType("income");
      const type2 = new TransactionType("income");

      expect(type1.equals(type2)).toBe(true);
    });

    it("should return false for different types", () => {
      const type1 = new TransactionType("income");
      const type2 = new TransactionType("expense");

      expect(type1.equals(type2)).toBe(false);
    });
  });

  describe("exhaustive type coverage", () => {
    it("should have a type guard for each valid type", () => {
      for (const typeValue of TRANSACTION_TYPES) {
        const type = new TransactionType(typeValue);

        const guardResults = [type.isIncome(), type.isExpense(), type.isTransfer()];

        expect(guardResults.filter(Boolean)).toHaveLength(1);
      }
    });
  });
});
