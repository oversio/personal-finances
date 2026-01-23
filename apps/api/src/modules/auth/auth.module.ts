import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users";
import { WorkspacesModule } from "../workspaces";
import {
  GoogleAuthHandler,
  LoginHandler,
  LogoutHandler,
  PASSWORD_HASHER,
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenHandler,
  RegisterHandler,
  TOKEN_SERVICE,
} from "./application";
import {
  AuthController,
  BcryptPasswordHasher,
  GoogleStrategy,
  JwtAuthGuard,
  JwtStrategy,
  JwtTokenService,
  MongooseRefreshTokenRepository,
  RefreshTokenModel,
  RefreshTokenSchema,
} from "./infrastructure";

const commandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  GoogleAuthHandler,
  LogoutHandler,
];

const repositories = [
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useClass: MongooseRefreshTokenRepository,
  },
];

const services = [
  {
    provide: PASSWORD_HASHER,
    useClass: BcryptPasswordHasher,
  },
  {
    provide: TOKEN_SERVICE,
    useClass: JwtTokenService,
  },
];

const strategies = [JwtStrategy, GoogleStrategy];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: (configService.get<string>("JWT_ACCESS_EXPIRATION") ??
            "15m") as `${number}${"s" | "m" | "h" | "d"}`,
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: RefreshTokenModel.name, schema: RefreshTokenSchema },
    ]),
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...repositories,
    ...services,
    ...strategies,
    JwtAuthGuard,
  ],
  exports: [...repositories, ...services, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
