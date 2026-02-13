import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { validateEnv } from "@/config";
import { AccountsModule } from "@/modules/accounts";
import { AuthModule, JwtAuthGuard } from "@/modules/auth";
import { BudgetsModule } from "@/modules/budgets";
import { CategoriesModule } from "@/modules/categories";
import { SharedModule } from "@/modules/shared/shared.module";
import { TransactionsModule } from "@/modules/transactions";
import { WorkspacesModule } from "@/modules/workspaces";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
    }),

    // Core modules
    EventEmitterModule.forRoot(),

    // Shared module (global)
    SharedModule,

    // App modules
    HealthModule,

    // Feature modules
    WorkspacesModule,
    AuthModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
  ],
  providers: [
    // Global JWT guard - all routes require authentication by default
    // Use @Public() decorator to make routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
