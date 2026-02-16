import { Global, Module } from "@nestjs/common";
import { EMAIL_SERVICE, RECAPTCHA_SERVICE } from "./application";
import { ResendEmailService, GoogleRecaptchaService } from "./infrastructure";

const emailServiceProvider = {
  provide: EMAIL_SERVICE,
  useClass: ResendEmailService,
};

const recaptchaServiceProvider = {
  provide: RECAPTCHA_SERVICE,
  useClass: GoogleRecaptchaService,
};

@Global()
@Module({
  imports: [],
  providers: [emailServiceProvider, recaptchaServiceProvider],
  exports: [emailServiceProvider, recaptchaServiceProvider],
})
export class SharedModule {}
