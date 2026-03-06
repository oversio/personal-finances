import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EMAIL_SERVICE, type EmailService } from "@/modules/shared/application";
import { USER_REPOSITORY, type UserRepository } from "@/modules/users";
import { EmailAlreadyVerifiedError } from "../../../domain/exceptions/auth.exceptions";
import { VERIFICATION_TOKEN_SERVICE, type VerificationTokenService } from "../../ports";
import { SendVerificationEmailCommand } from "./send-verification-email.command";

@Injectable()
export class SendVerificationEmailHandler {
  constructor(
    @Inject(VERIFICATION_TOKEN_SERVICE)
    private readonly verificationTokenService: VerificationTokenService,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: EmailService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);

    if (user?.isEmailVerified) {
      throw new EmailAlreadyVerifiedError();
    }

    const token = this.verificationTokenService.generateVerificationToken(
      command.userId,
      command.email,
    );

    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    await this.emailService.send({
      to: command.email,
      subject: "Verify your email address",
      html: this.buildEmailHtml(command.name, verificationLink),
    });
  }

  private buildEmailHtml(name: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">Verify your email</h1>
          </div>
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationLink}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </body>
      </html>
    `;
  }
}
