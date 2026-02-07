import { EntityId } from "@/modules/shared/domain/value-objects";
import { HexColor } from "@/modules/accounts/domain/value-objects";
import { CategoryName, CategoryType, Subcategory, SubcategoryPrimitives } from "../value-objects";

export class Category {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly name: CategoryName,
    public readonly type: CategoryType,
    public readonly subcategories: Subcategory[],
    public readonly icon: string | undefined,
    public readonly color: HexColor,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    workspaceId: string;
    name: string;
    type: string;
    subcategories?: Array<{ id?: string; name: string; icon?: string }>;
    icon?: string;
    color?: string;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Category {
    const now = new Date();

    return new Category(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      new CategoryName(params.name),
      new CategoryType(params.type),
      (params.subcategories ?? []).map(sub => Subcategory.create(sub)),
      params.icon,
      params.color ? new HexColor(params.color) : HexColor.default(),
      params.isArchived ?? false,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  archive(): Category {
    return new Category(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      this.subcategories,
      this.icon,
      this.color,
      true,
      this.createdAt,
      new Date(),
    );
  }

  update(params: { name?: string; type?: string; icon?: string; color?: string }): Category {
    return new Category(
      this.id,
      this.workspaceId,
      params.name ? new CategoryName(params.name) : this.name,
      params.type ? new CategoryType(params.type) : this.type,
      this.subcategories,
      params.icon !== undefined ? params.icon : this.icon,
      params.color ? new HexColor(params.color) : this.color,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  addSubcategory(subcategory: Subcategory): Category {
    return new Category(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      [...this.subcategories, subcategory],
      this.icon,
      this.color,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  updateSubcategory(subcategoryId: string, params: { name?: string; icon?: string }): Category {
    const updatedSubcategories = this.subcategories.map(sub =>
      sub.id === subcategoryId ? sub.update(params) : sub,
    );

    return new Category(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      updatedSubcategories,
      this.icon,
      this.color,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  removeSubcategory(subcategoryId: string): Category {
    return new Category(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      this.subcategories.filter(sub => sub.id !== subcategoryId),
      this.icon,
      this.color,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  findSubcategory(subcategoryId: string): Subcategory | undefined {
    return this.subcategories.find(sub => sub.id === subcategoryId);
  }

  toPrimitives(): {
    id: string | undefined;
    workspaceId: string;
    name: string;
    type: string;
    subcategories: SubcategoryPrimitives[];
    icon: string | undefined;
    color: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      name: this.name.value,
      type: this.type.value,
      subcategories: this.subcategories.map(sub => sub.toPrimitives()),
      icon: this.icon,
      color: this.color.value,
      isArchived: this.isArchived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
