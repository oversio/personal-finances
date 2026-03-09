import { ZodError } from "zod";

import { EntityId } from "./entity-id";

describe("EntityId", () => {
  describe("construction", () => {
    it("should create an EntityId with a valid string", () => {
      const id = new EntityId("abc-123");

      expect(id.value).toBe("abc-123");
    });

    it("should accept UUIDs", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id = new EntityId(uuid);

      expect(id.value).toBe(uuid);
    });

    it("should accept any non-empty string", () => {
      const id = new EntityId("1");

      expect(id.value).toBe("1");
    });
  });

  describe("validation", () => {
    it("should throw ZodError for empty string", () => {
      expect(() => new EntityId("")).toThrow(ZodError);
    });

    it("should throw with correct error message for empty string", () => {
      try {
        new EntityId("");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe("Entity ID cannot be empty");
      }
    });
  });

  describe("equals", () => {
    it("should return true for EntityIds with same value", () => {
      const id1 = new EntityId("abc-123");
      const id2 = new EntityId("abc-123");

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for EntityIds with different values", () => {
      const id1 = new EntityId("abc-123");
      const id2 = new EntityId("xyz-789");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the value as string", () => {
      const id = new EntityId("abc-123");

      expect(id.toString()).toBe("abc-123");
    });

    it("should work with string interpolation", () => {
      const id = new EntityId("abc-123");

      expect(`ID: ${id}`).toBe("ID: abc-123");
    });
  });
});
