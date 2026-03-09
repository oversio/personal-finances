import { ZodError } from "zod";

import { Money } from "./money";

describe("Money", () => {
  describe("construction", () => {
    it("should create Money with a positive value", () => {
      const money = new Money(100);

      expect(money.value).toBe(100);
    });

    it("should create Money with zero", () => {
      const money = new Money(0);

      expect(money.value).toBe(0);
    });

    it("should create Money with a negative value", () => {
      const money = new Money(-50);

      expect(money.value).toBe(-50);
    });

    it("should create Money with decimal values", () => {
      const money = new Money(99.99);

      expect(money.value).toBe(99.99);
    });
  });

  describe("validation", () => {
    it("should throw ZodError for Infinity", () => {
      expect(() => new Money(Infinity)).toThrow(ZodError);
    });

    it("should throw ZodError for negative Infinity", () => {
      expect(() => new Money(-Infinity)).toThrow(ZodError);
    });

    it("should throw ZodError for NaN", () => {
      expect(() => new Money(NaN)).toThrow(ZodError);
    });

    it("should throw with correct error message for non-finite number", () => {
      try {
        new Money(Infinity);
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
      }
    });
  });

  describe("static zero", () => {
    it("should create Money with value 0", () => {
      const money = Money.zero();

      expect(money.value).toBe(0);
      expect(money.isZero()).toBe(true);
    });
  });

  describe("add", () => {
    it("should add two positive Money values", () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.add(money2);

      expect(result.value).toBe(150);
    });

    it("should add positive and negative Money values", () => {
      const money1 = new Money(100);
      const money2 = new Money(-30);

      const result = money1.add(money2);

      expect(result.value).toBe(70);
    });

    it("should return new Money instance (immutability)", () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      const result = money1.add(money2);

      expect(result).not.toBe(money1);
      expect(result).not.toBe(money2);
      expect(money1.value).toBe(100);
      expect(money2.value).toBe(50);
    });

    it("should handle decimal addition", () => {
      const money1 = new Money(10.5);
      const money2 = new Money(20.25);

      const result = money1.add(money2);

      expect(result.value).toBeCloseTo(30.75);
    });
  });

  describe("subtract", () => {
    it("should subtract two Money values", () => {
      const money1 = new Money(100);
      const money2 = new Money(30);

      const result = money1.subtract(money2);

      expect(result.value).toBe(70);
    });

    it("should result in negative when subtracting larger amount", () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      const result = money1.subtract(money2);

      expect(result.value).toBe(-50);
      expect(result.isNegative()).toBe(true);
    });

    it("should return new Money instance (immutability)", () => {
      const money1 = new Money(100);
      const money2 = new Money(30);

      const result = money1.subtract(money2);

      expect(result).not.toBe(money1);
      expect(result).not.toBe(money2);
      expect(money1.value).toBe(100);
    });
  });

  describe("isNegative", () => {
    it("should return true for negative values", () => {
      expect(new Money(-1).isNegative()).toBe(true);
      expect(new Money(-0.01).isNegative()).toBe(true);
    });

    it("should return false for zero", () => {
      expect(new Money(0).isNegative()).toBe(false);
    });

    it("should return false for positive values", () => {
      expect(new Money(1).isNegative()).toBe(false);
      expect(new Money(0.01).isNegative()).toBe(false);
    });
  });

  describe("isZero", () => {
    it("should return true for zero", () => {
      expect(new Money(0).isZero()).toBe(true);
    });

    it("should return false for positive values", () => {
      expect(new Money(1).isZero()).toBe(false);
    });

    it("should return false for negative values", () => {
      expect(new Money(-1).isZero()).toBe(false);
    });
  });

  describe("isPositive", () => {
    it("should return true for positive values", () => {
      expect(new Money(1).isPositive()).toBe(true);
      expect(new Money(0.01).isPositive()).toBe(true);
    });

    it("should return false for zero", () => {
      expect(new Money(0).isPositive()).toBe(false);
    });

    it("should return false for negative values", () => {
      expect(new Money(-1).isPositive()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for Money with same value", () => {
      const money1 = new Money(100);
      const money2 = new Money(100);

      expect(money1.equals(money2)).toBe(true);
    });

    it("should return false for Money with different values", () => {
      const money1 = new Money(100);
      const money2 = new Money(200);

      expect(money1.equals(money2)).toBe(false);
    });

    it("should handle decimal comparisons", () => {
      const money1 = new Money(99.99);
      const money2 = new Money(99.99);

      expect(money1.equals(money2)).toBe(true);
    });
  });
});
