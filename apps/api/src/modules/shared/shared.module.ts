import { Global, Module } from "@nestjs/common";
import { EMAIL_SERVICE } from "./application";
import { ResendEmailService } from "./infrastructure";

const emailServiceProvider = {
  provide: EMAIL_SERVICE,
  useClass: ResendEmailService,
};

@Global()
@Module({
  imports: [],
  providers: [emailServiceProvider],
  exports: [emailServiceProvider],
})
export class SharedModule {}
