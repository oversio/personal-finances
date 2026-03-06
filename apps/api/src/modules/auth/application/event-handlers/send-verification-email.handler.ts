import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  SendVerificationEmailCommand,
  SendVerificationEmailHandler,
} from "../commands/send-verification-email";

interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  provider: string;
}

@Injectable()
export class SendVerificationEmailOnRegistrationHandler {
  constructor(private readonly sendVerificationEmailHandler: SendVerificationEmailHandler) {}

  @OnEvent("user.registered")
  async handle(event: UserRegisteredEvent): Promise<void> {
    // Only send verification email for local provider registrations
    if (event.provider !== "local") {
      return;
    }

    const command = new SendVerificationEmailCommand(event.userId, event.email, event.name);
    await this.sendVerificationEmailHandler.execute(command);
  }
}
