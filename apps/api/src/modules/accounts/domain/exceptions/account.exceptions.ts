import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class AccountNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Account with id ${id} not found`, {
      errorCode: ErrorCodes.accounts.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class AccountAlreadyExistsError extends DomainException {
  constructor(name: string) {
    super(`Account with name "${name}" already exists in this workspace`, {
      errorCode: ErrorCodes.accounts.alreadyExists,
      fieldName: "name",
      handler: "user",
    });
  }
}

export class InsufficientBalanceError extends DomainException {
  constructor(accountId: string, required: number, available: number) {
    super(
      `Insufficient balance in account ${accountId}. Required: ${required}, Available: ${available}`,
      {
        errorCode: ErrorCodes.accounts.insufficientBalance,
        fieldName: "amount",
        handler: "user",
      },
    );
  }
}
