import { Inject, Injectable } from "@nestjs/common";
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from "../../ports";
import { LogoutCommand } from "./logout.command";

@Injectable()
export class LogoutHandler {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    if (command.logoutAll && command.userId) {
      // Revoke all user's refresh tokens
      await this.refreshTokenRepository.revokeAllUserTokens(command.userId);
    } else {
      // Revoke only the provided refresh token
      await this.refreshTokenRepository.revokeToken(command.refreshToken);
    }
  }
}
