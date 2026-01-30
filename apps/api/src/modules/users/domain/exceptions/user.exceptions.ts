import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class UserNotFoundError extends DomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, {
      errorCode: ErrorCodes.users.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class UserAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, {
      errorCode: ErrorCodes.auth.emailAlreadyExists,
      fieldName: "email",
      handler: "user",
    });
  }
}
