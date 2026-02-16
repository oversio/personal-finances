import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super("Invalid email or password", {
      errorCode: ErrorCodes.auth.invalidCredentials,
      // Security: Don't reveal which field is wrong
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvalidRefreshTokenError extends DomainException {
  constructor() {
    super("Invalid or expired refresh token", {
      errorCode: ErrorCodes.auth.invalidRefreshToken,
      fieldName: null,
      handler: "user",
    });
  }
}

export class OAuthAccountNotLinkedError extends DomainException {
  constructor(provider: string, email: string) {
    super(`Account with email ${email} exists but is not linked to ${provider}`, {
      errorCode: ErrorCodes.auth.oauthAccountNotLinked,
      fieldName: null,
      handler: "user",
    });
  }
}

export class PasswordRequiredError extends DomainException {
  constructor() {
    super("Password is required for local authentication", {
      errorCode: ErrorCodes.auth.passwordRequired,
      fieldName: "password",
      handler: "user",
    });
  }
}

export class RecaptchaVerificationFailedError extends DomainException {
  constructor() {
    super("reCAPTCHA verification failed", {
      errorCode: ErrorCodes.recaptcha.verificationFailed,
      fieldName: null,
      handler: "user",
    });
  }
}

export class RecaptchaTokenMissingError extends DomainException {
  constructor() {
    super("reCAPTCHA token is required", {
      errorCode: ErrorCodes.recaptcha.tokenMissing,
      fieldName: "recaptchaToken",
      handler: "user",
    });
  }
}
