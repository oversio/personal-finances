import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import type { EnvConfig } from "@/config";
import { EMAIL_SERVICE, type EmailService } from "@/modules/shared/application";

interface InvitationSentEvent {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  expiresAt: Date;
}

@Injectable()
export class SendInvitationEmailHandler {
  private readonly logger = new Logger(SendInvitationEmailHandler.name);
  private readonly frontendUrl: string;

  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvConfig>,
  ) {
    this.frontendUrl = this.configService.get("FRONTEND_URL")!;
  }

  @OnEvent("workspace.invitation.sent")
  async handleInvitationSent(event: InvitationSentEvent): Promise<void> {
    await this.sendInvitationEmail(event);
  }

  @OnEvent("workspace.invitation.resent")
  async handleInvitationResent(event: InvitationSentEvent): Promise<void> {
    await this.sendInvitationEmail(event);
  }

  private async sendInvitationEmail(event: InvitationSentEvent): Promise<void> {
    const acceptUrl = `${this.frontendUrl}/invitation/accept?token=${event.token}`;
    const expiresDate = new Date(event.expiresAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Workspace Invitation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #111;">
              You've been invited to join a workspace
            </h1>
            <p style="margin: 0 0 24px; font-size: 16px; color: #666;">
              You've been invited to join <strong style="color: #111;">${event.workspaceName}</strong> as a <strong style="color: #111;">${event.role}</strong>.
            </p>
            <a href="${acceptUrl}" style="display: inline-block; background-color: #111; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 14px;">
              Accept Invitation
            </a>
          </div>
          <div style="font-size: 14px; color: #666;">
            <p style="margin: 0 0 8px;">
              This invitation will expire on ${expiresDate}.
            </p>
            <p style="margin: 0 0 16px;">
              If you don't have an account yet, you'll be able to create one after clicking the link.
            </p>
            <p style="margin: 0; color: #999; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `.trim();

    try {
      await this.emailService.send({
        to: event.email,
        subject: `You've been invited to join ${event.workspaceName}`,
        html,
      });

      this.logger.log(
        `Invitation email sent to ${event.email} for workspace ${event.workspaceName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${event.email}`, error);
    }
  }
}
