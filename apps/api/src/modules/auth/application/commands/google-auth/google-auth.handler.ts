import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { User, USER_REPOSITORY } from "@/modules/users";
import type { UserRepository } from "@/modules/users";
import { CreateWorkspaceCommand, CreateWorkspaceHandler } from "@/modules/workspaces/application";
import { RefreshToken } from "../../../domain/entities";
import { OAuthAccountNotLinkedError } from "../../../domain/exceptions";
import { REFRESH_TOKEN_REPOSITORY, TOKEN_SERVICE } from "../../ports";
import type { RefreshTokenRepository, TokenPair, TokenService } from "../../ports";
import { GoogleAuthCommand } from "./google-auth.command";

export interface GoogleAuthResult {
  user: ReturnType<User["toPrimitives"]>;
  tokens: TokenPair;
  isNewUser: boolean;
}

@Injectable()
export class GoogleAuthHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly createWorkspaceHandler: CreateWorkspaceHandler,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: GoogleAuthCommand,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<GoogleAuthResult> {
    let user: User | null = null;
    let isNewUser = false;

    // First, try to find by Google provider ID
    user = await this.userRepository.findByProviderId("google", command.googleId);

    if (!user) {
      // Check if user exists with same email
      const existingUser = await this.userRepository.findByEmail(command.email);

      if (existingUser) {
        // User exists but registered with different provider
        if (!existingUser.provider.isGoogle()) {
          throw new OAuthAccountNotLinkedError("Google", command.email);
        }
        user = existingUser;
      } else {
        // Create new user
        user = User.createFromOAuth(
          command.email,
          command.name,
          "google",
          command.googleId,
          command.picture,
        );
        user = await this.userRepository.save(user);
        isNewUser = true;

        // Auto-create default workspace for new users
        await this.createWorkspaceHandler.execute(
          new CreateWorkspaceCommand(
            `${command.name}'s Workspace`,
            user.id!.value,
            "USD",
            undefined,
            true, // isDefault
          ),
        );

        // Emit domain event
        this.eventEmitter.emit("user.registered", {
          userId: user.id!.value,
          email: user.email.value,
          provider: "google",
        });
      }
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
      isNewUser,
    };
  }
}
