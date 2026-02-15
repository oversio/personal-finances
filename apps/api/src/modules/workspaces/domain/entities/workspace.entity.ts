import { EntityId } from "@/modules/shared/domain/value-objects";
import { Currency, WorkspaceName } from "../value-objects";

export class Workspace {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly name: WorkspaceName,
    public readonly ownerId: EntityId,
    public readonly currency: Currency,
    public readonly timezone: string | undefined,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string | undefined,
    name: string,
    ownerId: string,
    currency: string = "USD",
    timezone?: string,
    isDefault: boolean = false,
    createdAt?: Date,
    updatedAt?: Date,
  ): Workspace {
    const now = new Date();
    return new Workspace(
      id ? new EntityId(id) : undefined,
      new WorkspaceName(name),
      new EntityId(ownerId),
      new Currency(currency),
      timezone,
      isDefault,
      createdAt ?? now,
      updatedAt ?? now,
    );
  }

  update(params: { name?: string; currency?: string; timezone?: string }): Workspace {
    return new Workspace(
      this.id,
      params.name ? new WorkspaceName(params.name) : this.name,
      this.ownerId,
      params.currency ? new Currency(params.currency) : this.currency,
      params.timezone !== undefined ? params.timezone : this.timezone,
      this.isDefault,
      this.createdAt,
      new Date(),
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      name: this.name.value,
      ownerId: this.ownerId.value,
      currency: this.currency.value,
      timezone: this.timezone,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
