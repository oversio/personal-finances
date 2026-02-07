import { randomUUID } from "crypto";
import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, { error: "Subcategory name is required" })
  .max(50, { error: "Subcategory name must be less than 50 characters" });

export interface SubcategoryPrimitives {
  id: string;
  name: string;
  icon?: string;
}

export class Subcategory {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly icon: string | undefined,
  ) {
    nameSchema.parse(name);
  }

  static create(params: { id?: string; name: string; icon?: string }): Subcategory {
    return new Subcategory(params.id ?? randomUUID(), params.name, params.icon);
  }

  update(params: { name?: string; icon?: string }): Subcategory {
    return new Subcategory(
      this.id,
      params.name ?? this.name,
      params.icon !== undefined ? params.icon : this.icon,
    );
  }

  toPrimitives(): SubcategoryPrimitives {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
    };
  }
}
