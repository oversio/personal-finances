import { DomainException } from "../../../shared/domain/exceptions";

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super("Invalid email or password");
  }
}

export class InvalidRefreshTokenError extends DomainException {
  constructor() {
    super("Invalid or expired refresh token");
  }
}

export class OAuthAccountNotLinkedError extends DomainException {
  constructor(provider: string, email: string) {
    super(
      `Account with email ${email} exists but is not linked to ${provider}`
    );
  }
}

export class PasswordRequiredError extends DomainException {
  constructor() {
    super("Password is required for local authentication");
  }
}
