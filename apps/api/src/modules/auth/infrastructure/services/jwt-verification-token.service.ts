import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { VerificationTokenPayload, VerificationTokenService } from "../../application/ports";

@Injectable()
export class JwtVerificationTokenService implements VerificationTokenService {
  private readonly expiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.expiration = this.configService.get<string>("EMAIL_VERIFICATION_EXPIRATION", "24h");
  }

  generateVerificationToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      purpose: "email_verification" as const,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.expiration as `${number}${"s" | "m" | "h" | "d"}`,
    });
  }

  verifyToken(token: string): VerificationTokenPayload | null {
    try {
      const payload = this.jwtService.verify<VerificationTokenPayload>(token);

      // Validate purpose claim to ensure this is a verification token
      if (payload.purpose !== "email_verification") {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
