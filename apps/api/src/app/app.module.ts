import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { SharedModule } from "../modules/shared/shared.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    // Core modules
    EventEmitterModule.forRoot(),

    // Shared module (global)
    SharedModule,

    // App modules
    HealthModule,

    // Feature modules (add here as you create them)
    // TransactionsModule,
    // AccountsModule,
    // CategoriesModule,
    // BudgetsModule,
  ],
})
export class AppModule {}
