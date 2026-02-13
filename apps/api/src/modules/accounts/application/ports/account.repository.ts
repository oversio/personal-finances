import { Account } from "../../domain/entities";

export const ACCOUNT_REPOSITORY = Symbol("ACCOUNT_REPOSITORY");

export interface AccountRepository {
  save(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByWorkspaceId(workspaceId: string, includeArchived?: boolean): Promise<Account[]>;
  findByNameAndWorkspace(name: string, workspaceId: string): Promise<Account | null>;
  update(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
  /**
   * Atomically updates the account balance by the given delta amount.
   * Positive delta = increase balance, negative delta = decrease balance.
   */
  updateBalance(accountId: string, delta: number): Promise<void>;
}
