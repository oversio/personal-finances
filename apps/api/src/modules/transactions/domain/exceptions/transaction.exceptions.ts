import { DomainException } from "@/modules/shared/domain/exceptions";
import { ErrorCodes } from "@/modules/shared/domain/exceptions/error-codes";

export class TransactionNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Transaction with id ${id} not found`, {
      errorCode: ErrorCodes.transactions.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class TransferRequiresToAccountError extends DomainException {
  constructor() {
    super("Transfer transactions require a destination account", {
      errorCode: ErrorCodes.transactions.transferRequiresToAccount,
      fieldName: "toAccountId",
      handler: "user",
    });
  }
}

export class CategoryRequiredError extends DomainException {
  constructor(type: string) {
    super(`${type} transactions require a category`, {
      errorCode: ErrorCodes.transactions.categoryRequired,
      fieldName: "categoryId",
      handler: "user",
    });
  }
}

export class SameAccountTransferError extends DomainException {
  constructor() {
    super("Cannot transfer to the same account", {
      errorCode: ErrorCodes.transactions.sameAccountTransfer,
      fieldName: "toAccountId",
      handler: "user",
    });
  }
}

export class InvalidTransactionAmountError extends DomainException {
  constructor(message: string) {
    super(message, {
      errorCode: ErrorCodes.transactions.invalidAmount,
      fieldName: "amount",
      handler: "user",
    });
  }
}

export class InvalidTransactionDateError extends DomainException {
  constructor(message: string) {
    super(message, {
      errorCode: ErrorCodes.transactions.invalidDate,
      fieldName: "date",
      handler: "user",
    });
  }
}
