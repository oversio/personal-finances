export const EMAIL_SERVICE = Symbol("EMAIL_SERVICE");

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailService {
  send(options: SendEmailOptions): Promise<void>;
}
