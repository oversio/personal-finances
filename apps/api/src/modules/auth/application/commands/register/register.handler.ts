import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  User,
  Password,
  USER_REPOSITORY,
  UserAlreadyExistsError,
} from "@/modules/users";
import type { UserRepository } from "@/modules/users";
import {
  CreateWorkspaceCommand,
  CreateWorkspaceHandler,
} from "@/modules/workspaces/application";
import { RefreshToken } from "../../../domain/entities";
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
import { RegisterCommand } from "./register.command";

export interface RegisterResult {
  user: ReturnType<User["toPrimitives"]>;
  tokens: TokenPair;
}

@Injectable()
export class RegisterHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly createWorkspaceHandler: CreateWorkspaceHandler,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(
    command: RegisterCommand,
    metadata?: { userAgent?: string; ipAddress?: string }
  ): Promise<RegisterResult> {
    // Validate password format
    new Password(command.password);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email);
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Create user
    const user = User.createLocal(command.email, command.name, passwordHash);
    const savedUser = await this.userRepository.save(user);

    // Auto-create workspace for the user
    await this.createWorkspaceHandler.execute(
      new CreateWorkspaceCommand(
        `${command.name}'s Workspace`,
        savedUser.id!.value
      )
    );

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: savedUser.id!.value,
      email: savedUser.email.value,
    });
    const refreshTokenValue = this.tokenService.generateRefreshToken();

    // Save refresh token
    const refreshToken = RefreshToken.create(
      undefined,
      savedUser.id!.value,
      refreshTokenValue,
      this.tokenService.getRefreshTokenExpiration(),
      undefined,
      undefined,
      metadata?.userAgent,
      metadata?.ipAddress
    );
    await this.refreshTokenRepository.save(refreshToken);

    // Emit domain event
    this.eventEmitter.emit("user.registered", {
      userId: savedUser.id!.value,
      email: savedUser.email.value,
      provider: "local",
    });

    return {
      user: savedUser.toPrimitives(),
      tokens: {
        accessToken,
        refreshToken: refreshTokenValue,
        expiresIn: 900, // 15 minutes in seconds
      },
    };
  }
}
