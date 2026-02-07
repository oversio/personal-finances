import { EntityId } from "@/modules/shared/domain/value-objects";
import { Currency } from "@/modules/workspaces/domain/value-objects";
import { AccountName, AccountType, HexColor, Money } from "../value-objects";

export class Account {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly name: AccountName,
    public readonly type: AccountType,
    public readonly currency: Currency,
    public readonly initialBalance: Money,
    public readonly currentBalance: Money,
    public readonly color: HexColor,
    public readonly icon: string | undefined,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    workspaceId: string;
    name: string;
    type: string;
    currency: string;
    initialBalance: number;
    currentBalance?: number;
    color?: string;
    icon?: string;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Account {
    const now = new Date();
    const initialBalance = new Money(params.initialBalance);

    return new Account(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      new AccountName(params.name),
      new AccountType(params.type),
      new Currency(params.currency),
      initialBalance,
      params.currentBalance !== undefined ? new Money(params.currentBalance) : initialBalance,
      params.color ? new HexColor(params.color) : HexColor.default(),
      params.icon,
      params.isArchived ?? false,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  archive(): Account {
    return new Account(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      this.currency,
      this.initialBalance,
      this.currentBalance,
      this.color,
      this.icon,
      true,
      this.createdAt,
      new Date(),
    );
  }

  updateBalance(newBalance: Money): Account {
    return new Account(
      this.id,
      this.workspaceId,
      this.name,
      this.type,
      this.currency,
      this.initialBalance,
      newBalance,
      this.color,
      this.icon,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  update(params: { name?: string; type?: string; color?: string; icon?: string }): Account {
    return new Account(
      this.id,
      this.workspaceId,
      params.name ? new AccountName(params.name) : this.name,
      params.type ? new AccountType(params.type) : this.type,
      this.currency,
      this.initialBalance,
      this.currentBalance,
      params.color ? new HexColor(params.color) : this.color,
      params.icon !== undefined ? params.icon : this.icon,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      name: this.name.value,
      type: this.type.value,
      currency: this.currency.value,
      initialBalance: this.initialBalance.value,
      currentBalance: this.currentBalance.value,
      color: this.color.value,
      icon: this.icon,
      isArchived: this.isArchived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
