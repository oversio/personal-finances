import { EntityId } from "@/modules/shared/domain/value-objects";
import { Currency, WorkspaceName } from "../value-objects";

export class Workspace {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly name: WorkspaceName,
    public readonly ownerId: EntityId,
    public readonly currency: Currency,
    public readonly timezone: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string | undefined,
    name: string,
    ownerId: string,
    currency: string = "USD",
    timezone?: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Workspace {
    const now = new Date();
    return new Workspace(
      id ? new EntityId(id) : undefined,
      new WorkspaceName(name),
      new EntityId(ownerId),
      new Currency(currency),
      timezone,
      createdAt ?? now,
      updatedAt ?? now
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      name: this.name.value,
      ownerId: this.ownerId.value,
      currency: this.currency.value,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
