import { DomainException } from "@/modules/shared/domain/exceptions";
import { ErrorCodes } from "@/modules/shared/domain/exceptions/error-codes";

export class RecurringTransactionNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Recurring transaction with id ${id} not found`, {
      errorCode: ErrorCodes.recurringTransactions.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvalidFrequencyError extends DomainException {
  constructor(message: string) {
    super(message, {
      errorCode: ErrorCodes.recurringTransactions.invalidFrequency,
      fieldName: "frequency",
      handler: "user",
    });
  }
}

export class InvalidIntervalError extends DomainException {
  constructor(message: string) {
    super(message, {
      errorCode: ErrorCodes.recurringTransactions.invalidInterval,
      fieldName: "interval",
      handler: "user",
    });
  }
}

export class InvalidScheduleError extends DomainException {
  constructor(message: string, fieldName: string) {
    super(message, {
      errorCode: ErrorCodes.recurringTransactions.invalidSchedule,
      fieldName,
      handler: "user",
    });
  }
}

export class InvalidDateRangeError extends DomainException {
  constructor() {
    super("End date must be after start date", {
      errorCode: ErrorCodes.recurringTransactions.invalidDateRange,
      fieldName: "endDate",
      handler: "user",
    });
  }
}

export class AlreadyPausedError extends DomainException {
  constructor() {
    super("Recurring transaction is already paused", {
      errorCode: ErrorCodes.recurringTransactions.alreadyPaused,
      fieldName: null,
      handler: "user",
    });
  }
}

export class AlreadyActiveError extends DomainException {
  constructor() {
    super("Recurring transaction is already active", {
      errorCode: ErrorCodes.recurringTransactions.alreadyActive,
      fieldName: null,
      handler: "user",
    });
  }
}

export class TransferNotAllowedError extends DomainException {
  constructor() {
    super("Recurring transactions cannot be transfers. Only income and expense are allowed.", {
      errorCode: ErrorCodes.recurringTransactions.transferNotAllowed,
      fieldName: "type",
      handler: "user",
    });
  }
}
