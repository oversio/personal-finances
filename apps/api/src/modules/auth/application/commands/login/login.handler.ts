import { Inject, Injectable } from "@nestjs/common";
import { User, USER_REPOSITORY } from "@/modules/users";
import type { UserRepository } from "@/modules/users";
import { RefreshToken } from "../../../domain/entities";
import {
  InvalidCredentialsError,
  PasswordRequiredError,
} from "../../../domain/exceptions";
import {
  PASSWORD_HASHER,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
} from "../../ports";
import type {
  PasswordHasher,
  RefreshTokenRepository,
  TokenPair,
  TokenService,
} from "../../ports";
import { LoginCommand } from "./login.command";

export interface LoginResult {
  user: ReturnType<User["toPrimitives"]>;
  tokens: TokenPair;
}

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    command: LoginCommand,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<LoginResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Check if user has a password (local auth)
    if (!user.passwordHash) {
      throw new PasswordRequiredError();
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash.value,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id!.value,
      email: user.email.value,
    });
    const refreshTokenValue = this.tokenService.generateRefreshToken();

    // Save refresh token
    const refreshToken = RefreshToken.create(
      undefined,
      user.id!.value,
      refreshTokenValue,
      this.tokenService.getRefreshTokenExpiration(),
      undefined,
      undefined,
      metadata?.userAgent,
      metadata?.ipAddress,
    );
    await this.refreshTokenRepository.save(refreshToken);

    return {
      user: user.toPrimitives(),
      tokens: {
        accessToken,
        refreshToken: refreshTokenValue,
        expiresIn: 900,
      },
    };
  }
}
