import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { EmailService, SendEmailOptions } from "../../application/ports";
import type { EnvConfig } from "@/config";

@Injectable()
export class ResendEmailService implements EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(ResendEmailService.name);

  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.resend = new Resend(this.configService.get("RESEND_API_KEY"));
    this.fromEmail = this.configService.get("RESEND_FROM_EMAIL")!;
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${options.to}`, error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
      throw err;
    }
  }
}
