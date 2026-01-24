import { DomainException } from "@/modules/shared/domain/exceptions";

export class UserNotFoundError extends DomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

export class UserAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
