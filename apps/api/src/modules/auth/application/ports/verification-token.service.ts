export const VERIFICATION_TOKEN_SERVICE = Symbol("VERIFICATION_TOKEN_SERVICE");

export interface VerificationTokenPayload {
  userId: string;
  email: string;
  purpose: "email_verification";
}

export interface VerificationTokenService {
  generateVerificationToken(userId: string, email: string): string;
  verifyToken(token: string): VerificationTokenPayload | null;
}
