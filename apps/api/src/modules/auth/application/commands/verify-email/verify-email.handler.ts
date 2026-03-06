import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, UserNotFoundError, type UserRepository } from "@/modules/users";
import {
  EmailAlreadyVerifiedError,
  VerificationTokenInvalidError,
} from "../../../domain/exceptions/auth.exceptions";
import { VERIFICATION_TOKEN_SERVICE, type VerificationTokenService } from "../../ports";
import { VerifyEmailCommand } from "./verify-email.command";

export interface VerifyEmailResult {
  message: string;
}

@Injectable()
export class VerifyEmailHandler {
  constructor(
    @Inject(VERIFICATION_TOKEN_SERVICE)
    private readonly verificationTokenService: VerificationTokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    const payload = this.verificationTokenService.verifyToken(command.token);

    if (!payload) {
      // Token is invalid or expired - we distinguish by attempting to decode without verification
      throw new VerificationTokenInvalidError();
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UserNotFoundError(payload.userId);
    }

    // Verify email matches the one in the token (security check)
    if (user.email.value !== payload.email) {
      throw new VerificationTokenInvalidError();
    }

    if (user.isEmailVerified) {
      throw new EmailAlreadyVerifiedError();
    }

    const verifiedUser = user.withEmailVerified();
    await this.userRepository.update(verifiedUser);

    return { message: "Email verified successfully" };
  }
}
