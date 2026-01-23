import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, UserNotFoundError } from "../../../../users";
import type { UserRepository } from "../../../../users";
import { RefreshToken } from "../../../domain/entities";
import { InvalidRefreshTokenError } from "../../../domain/exceptions";
import { REFRESH_TOKEN_REPOSITORY, TOKEN_SERVICE } from "../../ports";
import type { RefreshTokenRepository, TokenPair, TokenService } from "../../ports";
import { RefreshTokenCommand } from "./refresh-token.command";

export interface RefreshTokenResult {
  tokens: TokenPair;
}

@Injectable()
export class RefreshTokenHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<RefreshTokenResult> {
    // Find the refresh token
    const existingToken = await this.refreshTokenRepository.findByToken(
      command.refreshToken,
    );

    if (!existingToken || !existingToken.isValid()) {
      throw new InvalidRefreshTokenError();
    }

    // Get the user
    const user = await this.userRepository.findById(existingToken.userId.value);
    if (!user) {
      throw new UserNotFoundError(existingToken.userId.value);
    }

    // Revoke the old refresh token (rotation)
    await this.refreshTokenRepository.revokeToken(command.refreshToken);

    // Generate new tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id!.value,
      email: user.email.value,
    });
    const newRefreshTokenValue = this.tokenService.generateRefreshToken();

    // Save new refresh token
    const newRefreshToken = RefreshToken.create(
      undefined,
      user.id!.value,
      newRefreshTokenValue,
      this.tokenService.getRefreshTokenExpiration(),
      undefined,
      undefined,
      metadata?.userAgent,
      metadata?.ipAddress,
    );
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      tokens: {
        accessToken,
        refreshToken: newRefreshTokenValue,
        expiresIn: 900,
      },
    };
  }
}
