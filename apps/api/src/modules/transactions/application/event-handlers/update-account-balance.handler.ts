import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "@/modules/accounts";

export interface TransactionCreatedEvent {
  transactionId: string;
  workspaceId: string;
  type: "income" | "expense" | "transfer";
  accountId: string;
  toAccountId?: string;
  amount: number;
}

export interface TransactionArchivedEvent {
  transactionId: string;
  workspaceId: string;
  type: "income" | "expense" | "transfer";
  accountId: string;
  toAccountId?: string;
  amount: number;
}

export interface TransactionUpdatedEvent {
  transactionId: string;
  workspaceId: string;
  // Old values (to reverse)
  oldType: "income" | "expense" | "transfer";
  oldAccountId: string;
  oldToAccountId?: string;
  oldAmount: number;
  // New values (to apply)
  newType: "income" | "expense" | "transfer";
  newAccountId: string;
  newToAccountId?: string;
  newAmount: number;
}

@Injectable()
export class UpdateAccountBalanceHandler {
  private readonly logger = new Logger(UpdateAccountBalanceHandler.name);

  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * When a transaction is created, update account balances accordingly:
   * - income: add to account
   * - expense: subtract from account
   * - transfer: subtract from source, add to destination
   */
  @OnEvent("transaction.created")
  async handleTransactionCreated(event: TransactionCreatedEvent): Promise<void> {
    this.logger.log(`Updating balances for created transaction ${event.transactionId}`);

    await this.applyBalanceChange(event.type, event.accountId, event.toAccountId, event.amount);
  }

  /**
   * When a transaction is archived, reverse the original balance changes:
   * - income: subtract from account
   * - expense: add back to account
   * - transfer: add back to source, subtract from destination
   */
  @OnEvent("transaction.archived")
  async handleTransactionArchived(event: TransactionArchivedEvent): Promise<void> {
    this.logger.log(`Reversing balances for archived transaction ${event.transactionId}`);

    await this.reverseBalanceChange(event.type, event.accountId, event.toAccountId, event.amount);
  }

  /**
   * When a transaction is updated, reverse the old balance changes and apply the new ones.
   * This handles changes in type, account, toAccount, or amount.
   */
  @OnEvent("transaction.updated")
  async handleTransactionUpdated(event: TransactionUpdatedEvent): Promise<void> {
    this.logger.log(`Updating balances for updated transaction ${event.transactionId}`);

    // Reverse the old transaction's effect
    await this.reverseBalanceChange(
      event.oldType,
      event.oldAccountId,
      event.oldToAccountId,
      event.oldAmount,
    );

    // Apply the new transaction's effect
    await this.applyBalanceChange(
      event.newType,
      event.newAccountId,
      event.newToAccountId,
      event.newAmount,
    );
  }

  /**
   * Apply balance changes for a transaction (when created or as "new" part of update)
   */
  private async applyBalanceChange(
    type: "income" | "expense" | "transfer",
    accountId: string,
    toAccountId: string | undefined,
    amount: number,
  ): Promise<void> {
    switch (type) {
      case "income":
        // Income adds to the account
        await this.accountRepository.updateBalance(accountId, amount);
        break;

      case "expense":
        // Expense subtracts from the account
        await this.accountRepository.updateBalance(accountId, -amount);
        break;

      case "transfer":
        // Transfer subtracts from source and adds to destination
        await this.accountRepository.updateBalance(accountId, -amount);
        if (toAccountId) {
          await this.accountRepository.updateBalance(toAccountId, amount);
        }
        break;
    }
  }

  /**
   * Reverse balance changes for a transaction (when archived or as "old" part of update)
   */
  private async reverseBalanceChange(
    type: "income" | "expense" | "transfer",
    accountId: string,
    toAccountId: string | undefined,
    amount: number,
  ): Promise<void> {
    switch (type) {
      case "income":
        // Reverse income: subtract from account
        await this.accountRepository.updateBalance(accountId, -amount);
        break;

      case "expense":
        // Reverse expense: add back to account
        await this.accountRepository.updateBalance(accountId, amount);
        break;

      case "transfer":
        // Reverse transfer: add back to source, subtract from destination
        await this.accountRepository.updateBalance(accountId, amount);
        if (toAccountId) {
          await this.accountRepository.updateBalance(toAccountId, -amount);
        }
        break;
    }
  }
}
