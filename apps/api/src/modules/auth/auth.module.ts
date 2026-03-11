import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "@/modules/users";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  GoogleAuthHandler,
  LoginHandler,
  LogoutHandler,
  PASSWORD_HASHER,
  REFRESH_TOKEN_REPOSITORY,
  RefreshTokenHandler,
  RegisterHandler,
  SendVerificationEmailHandler,
  SendVerificationEmailOnRegistrationHandler,
  TOKEN_SERVICE,
  VERIFICATION_TOKEN_SERVICE,
  VerifyEmailHandler,
} from "./application";
import {
  AuthController,
  BcryptPasswordHasher,
  GoogleStrategy,
  JwtAuthGuard,
  JwtStrategy,
  JwtTokenService,
  JwtVerificationTokenService,
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
  VerifyEmailHandler,
  SendVerificationEmailHandler,
];

const eventHandlers = [SendVerificationEmailOnRegistrationHandler];

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
  {
    provide: VERIFICATION_TOKEN_SERVICE,
    useClass: JwtVerificationTokenService,
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
            "1d") as `${number}${"s" | "m" | "h" | "d"}`,
        },
      }),
    }),
    MongooseModule.forFeature([{ name: RefreshTokenModel.name, schema: RefreshTokenSchema }]),
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...repositories,
    ...services,
    ...strategies,
    JwtAuthGuard,
  ],
  exports: [...repositories, ...services, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
