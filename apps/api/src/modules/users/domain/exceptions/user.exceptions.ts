import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class UserNotFoundError extends DomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      errorCode: ErrorCodes.users.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class UserAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      errorCode: ErrorCodes.auth.emailAlreadyExists,
      fieldName: "email",
      handler: "user",
    });
  }
}
