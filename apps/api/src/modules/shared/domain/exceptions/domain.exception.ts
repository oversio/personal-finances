import type { ErrorHandler } from "./api-error";
import { ErrorCodes } from "./error-codes";

export interface DomainExceptionOptions {
  /** Dot notation error code for i18n lookup */
  errorCode: string;
  /** Form field name, or null for general/security-sensitive errors */
  fieldName?: string | null;
  /** "user" = display to user, "system" = log/generic message */
  handler?: ErrorHandler;
}

export abstract class DomainException extends Error {
  readonly errorCode: string;
  readonly fieldName: string | null;
  readonly handler: ErrorHandler;

  constructor(message: string, options: DomainExceptionOptions) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode = options.errorCode;
    this.fieldName = options.fieldName ?? null;
    this.handler = options.handler ?? "user";
  }
}

export class InvalidEntityIdError extends DomainException {
  constructor(id: string) {
    super(`Invalid entity ID: ${id}`, {
      errorCode: ErrorCodes.entity.invalidId,
      fieldName: "id",
      handler: "user",
    });
  }
}

export class EntityNotFoundError extends DomainException {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, {
      errorCode: ErrorCodes.entity.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class EntityAlreadyExistsError extends DomainException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} "${value}" already exists`, {
      errorCode: ErrorCodes.entity.alreadyExists,
      fieldName: field,
      handler: "user",
    });
  }
}
