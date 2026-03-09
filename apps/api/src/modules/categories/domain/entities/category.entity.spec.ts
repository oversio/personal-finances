import { ZodError } from "zod";

import { Subcategory } from "../value-objects";
import { Category } from "./category.entity";

describe("Category", () => {
  const validParams = {
    workspaceId: "workspace-123",
    name: "Food & Dining",
    type: "expense",
  };

  describe("create", () => {
    it("should create a category with required fields", () => {
      const category = Category.create(validParams);

      expect(category.workspaceId.value).toBe("workspace-123");
      expect(category.name.value).toBe("Food & Dining");
      expect(category.type.value).toBe("expense");
      expect(category.id).toBeUndefined();
    });

    it("should create a category with optional id", () => {
      const category = Category.create({ ...validParams, id: "cat-123" });

      expect(category.id?.value).toBe("cat-123");
    });

    it("should create a category with income type", () => {
      const category = Category.create({ ...validParams, type: "income" });

      expect(category.type.value).toBe("income");
    });

    it("should default subcategories to empty array", () => {
      const category = Category.create(validParams);

      expect(category.subcategories).toEqual([]);
    });

    it("should create subcategories from params", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ name: "Restaurants" }, { name: "Groceries", icon: "cart" }],
      });

      expect(category.subcategories).toHaveLength(2);
      expect(category.subcategories[0].name).toBe("Restaurants");
      expect(category.subcategories[1].name).toBe("Groceries");
      expect(category.subcategories[1].icon).toBe("cart");
    });

    it("should generate UUID for subcategories without id", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ name: "Test" }],
      });

      expect(category.subcategories[0].id).toBeDefined();
      expect(category.subcategories[0].id.length).toBeGreaterThan(0);
    });

    it("should use provided subcategory id", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-123", name: "Test" }],
      });

      expect(category.subcategories[0].id).toBe("sub-123");
    });

    it("should default icon to undefined", () => {
      const category = Category.create(validParams);

      expect(category.icon).toBeUndefined();
    });

    it("should set icon when provided", () => {
      const category = Category.create({ ...validParams, icon: "utensils" });

      expect(category.icon).toBe("utensils");
    });

    it("should default color to HexColor.default()", () => {
      const category = Category.create(validParams);

      expect(category.color.value).toBe("#6366F1");
    });

    it("should set custom color when provided", () => {
      const category = Category.create({ ...validParams, color: "#FF5733" });

      expect(category.color.value).toBe("#FF5733");
    });

    it("should default isArchived to false", () => {
      const category = Category.create(validParams);

      expect(category.isArchived).toBe(false);
    });

    it("should set isArchived when provided", () => {
      const category = Category.create({ ...validParams, isArchived: true });

      expect(category.isArchived).toBe(true);
    });

    it("should set createdAt and updatedAt to current date by default", () => {
      const before = new Date();
      const category = Category.create(validParams);
      const after = new Date();

      expect(category.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(category.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should use provided dates", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const category = Category.create({ ...validParams, createdAt, updatedAt });

      expect(category.createdAt).toBe(createdAt);
      expect(category.updatedAt).toBe(updatedAt);
    });

    describe("validation", () => {
      it("should throw for empty name", () => {
        expect(() => Category.create({ ...validParams, name: "" })).toThrow(ZodError);
      });

      it("should throw for name exceeding 50 characters", () => {
        const longName = "a".repeat(51);
        expect(() => Category.create({ ...validParams, name: longName })).toThrow(ZodError);
      });

      it("should throw for invalid type", () => {
        expect(() => Category.create({ ...validParams, type: "invalid" })).toThrow(ZodError);
      });

      it("should throw for invalid color format", () => {
        expect(() => Category.create({ ...validParams, color: "red" })).toThrow(ZodError);
      });

      it("should throw for empty workspaceId", () => {
        expect(() => Category.create({ ...validParams, workspaceId: "" })).toThrow(ZodError);
      });
    });
  });

  describe("archive", () => {
    it("should return new category with isArchived true", () => {
      const category = Category.create(validParams);
      const archived = category.archive();

      expect(archived.isArchived).toBe(true);
      expect(category.isArchived).toBe(false);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const category = Category.create({ ...validParams, updatedAt: oldDate });

      const before = new Date();
      const archived = category.archive();

      expect(archived.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should preserve all other fields", () => {
      const category = Category.create({
        ...validParams,
        id: "cat-123",
        icon: "food",
        color: "#FF0000",
        subcategories: [{ name: "Test" }],
      });
      const archived = category.archive();

      expect(archived.id?.value).toBe("cat-123");
      expect(archived.name.value).toBe("Food & Dining");
      expect(archived.icon).toBe("food");
      expect(archived.color.value).toBe("#FF0000");
      expect(archived.subcategories).toHaveLength(1);
    });

    it("should return new instance (immutability)", () => {
      const category = Category.create(validParams);
      const archived = category.archive();

      expect(archived).not.toBe(category);
    });
  });

  describe("update", () => {
    it("should update name", () => {
      const category = Category.create(validParams);
      const updated = category.update({ name: "New Name" });

      expect(updated.name.value).toBe("New Name");
      expect(category.name.value).toBe("Food & Dining");
    });

    it("should update type", () => {
      const category = Category.create(validParams);
      const updated = category.update({ type: "income" });

      expect(updated.type.value).toBe("income");
    });

    it("should update icon", () => {
      const category = Category.create(validParams);
      const updated = category.update({ icon: "new-icon" });

      expect(updated.icon).toBe("new-icon");
    });

    it("should allow clearing icon with empty string", () => {
      const category = Category.create({ ...validParams, icon: "old-icon" });
      const updated = category.update({ icon: "" });

      expect(updated.icon).toBe("");
    });

    it("should update color", () => {
      const category = Category.create(validParams);
      const updated = category.update({ color: "#00FF00" });

      expect(updated.color.value).toBe("#00FF00");
    });

    it("should update multiple fields at once", () => {
      const category = Category.create(validParams);
      const updated = category.update({
        name: "New Name",
        type: "income",
        icon: "star",
        color: "#AABBCC",
      });

      expect(updated.name.value).toBe("New Name");
      expect(updated.type.value).toBe("income");
      expect(updated.icon).toBe("star");
      expect(updated.color.value).toBe("#AABBCC");
    });

    it("should preserve fields not being updated", () => {
      const category = Category.create({
        ...validParams,
        icon: "food",
        color: "#FF0000",
      });
      const updated = category.update({ name: "New Name" });

      expect(updated.icon).toBe("food");
      expect(updated.color.value).toBe("#FF0000");
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const category = Category.create({ ...validParams, updatedAt: oldDate });

      const before = new Date();
      const updated = category.update({ name: "New Name" });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should return new instance (immutability)", () => {
      const category = Category.create(validParams);
      const updated = category.update({ name: "New Name" });

      expect(updated).not.toBe(category);
    });

    it("should keep existing name when empty string is passed (falsy check)", () => {
      const category = Category.create(validParams);
      const updated = category.update({ name: "" });

      expect(updated.name.value).toBe("Food & Dining");
    });

    it("should validate new type", () => {
      const category = Category.create(validParams);

      expect(() => category.update({ type: "invalid" })).toThrow(ZodError);
    });
  });

  describe("addSubcategory", () => {
    it("should add subcategory to the list", () => {
      const category = Category.create(validParams);
      const subcategory = Subcategory.create({ name: "Restaurants" });
      const updated = category.addSubcategory(subcategory);

      expect(updated.subcategories).toHaveLength(1);
      expect(updated.subcategories[0].name).toBe("Restaurants");
    });

    it("should append to existing subcategories", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ name: "Existing" }],
      });
      const subcategory = Subcategory.create({ name: "New" });
      const updated = category.addSubcategory(subcategory);

      expect(updated.subcategories).toHaveLength(2);
      expect(updated.subcategories[0].name).toBe("Existing");
      expect(updated.subcategories[1].name).toBe("New");
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const category = Category.create({ ...validParams, updatedAt: oldDate });
      const subcategory = Subcategory.create({ name: "Test" });

      const before = new Date();
      const updated = category.addSubcategory(subcategory);

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it("should return new instance (immutability)", () => {
      const category = Category.create(validParams);
      const subcategory = Subcategory.create({ name: "Test" });
      const updated = category.addSubcategory(subcategory);

      expect(updated).not.toBe(category);
      expect(category.subcategories).toHaveLength(0);
    });
  });

  describe("updateSubcategory", () => {
    it("should update subcategory name", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Old Name" }],
      });
      const updated = category.updateSubcategory("sub-1", { name: "New Name" });

      expect(updated.subcategories[0].name).toBe("New Name");
    });

    it("should update subcategory icon", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const updated = category.updateSubcategory("sub-1", { icon: "new-icon" });

      expect(updated.subcategories[0].icon).toBe("new-icon");
    });

    it("should only update matching subcategory", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [
          { id: "sub-1", name: "First" },
          { id: "sub-2", name: "Second" },
        ],
      });
      const updated = category.updateSubcategory("sub-1", { name: "Updated First" });

      expect(updated.subcategories[0].name).toBe("Updated First");
      expect(updated.subcategories[1].name).toBe("Second");
    });

    it("should preserve subcategory id", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const updated = category.updateSubcategory("sub-1", { name: "New Name" });

      expect(updated.subcategories[0].id).toBe("sub-1");
    });

    it("should return unchanged if subcategory not found", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const updated = category.updateSubcategory("non-existent", { name: "New Name" });

      expect(updated.subcategories[0].name).toBe("Test");
    });
  });

  describe("removeSubcategory", () => {
    it("should remove subcategory by id", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const updated = category.removeSubcategory("sub-1");

      expect(updated.subcategories).toHaveLength(0);
    });

    it("should only remove matching subcategory", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [
          { id: "sub-1", name: "First" },
          { id: "sub-2", name: "Second" },
        ],
      });
      const updated = category.removeSubcategory("sub-1");

      expect(updated.subcategories).toHaveLength(1);
      expect(updated.subcategories[0].id).toBe("sub-2");
    });

    it("should return unchanged if subcategory not found", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const updated = category.removeSubcategory("non-existent");

      expect(updated.subcategories).toHaveLength(1);
    });

    it("should update updatedAt", () => {
      const oldDate = new Date("2024-01-01");
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
        updatedAt: oldDate,
      });

      const before = new Date();
      const updated = category.removeSubcategory("sub-1");

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("findSubcategory", () => {
    it("should find existing subcategory", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test", icon: "icon" }],
      });
      const found = category.findSubcategory("sub-1");

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test");
      expect(found?.icon).toBe("icon");
    });

    it("should return undefined for non-existent subcategory", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const found = category.findSubcategory("non-existent");

      expect(found).toBeUndefined();
    });

    it("should return undefined for empty subcategories", () => {
      const category = Category.create(validParams);
      const found = category.findSubcategory("any-id");

      expect(found).toBeUndefined();
    });
  });

  describe("toPrimitives", () => {
    it("should serialize all fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const category = Category.create({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food",
        type: "expense",
        subcategories: [{ id: "sub-1", name: "Restaurants", icon: "fork" }],
        icon: "food",
        color: "#FF0000",
        isArchived: false,
        createdAt,
        updatedAt,
      });

      const primitives = category.toPrimitives();

      expect(primitives).toEqual({
        id: "cat-123",
        workspaceId: "workspace-123",
        name: "Food",
        type: "expense",
        subcategories: [{ id: "sub-1", name: "Restaurants", icon: "fork" }],
        icon: "food",
        color: "#FF0000",
        isArchived: false,
        createdAt,
        updatedAt,
      });
    });

    it("should serialize undefined id as undefined", () => {
      const category = Category.create(validParams);
      const primitives = category.toPrimitives();

      expect(primitives.id).toBeUndefined();
    });

    it("should serialize empty subcategories as empty array", () => {
      const category = Category.create(validParams);
      const primitives = category.toPrimitives();

      expect(primitives.subcategories).toEqual([]);
    });

    it("should serialize subcategory without icon", () => {
      const category = Category.create({
        ...validParams,
        subcategories: [{ id: "sub-1", name: "Test" }],
      });
      const primitives = category.toPrimitives();

      expect(primitives.subcategories[0].icon).toBeUndefined();
    });
  });
});
