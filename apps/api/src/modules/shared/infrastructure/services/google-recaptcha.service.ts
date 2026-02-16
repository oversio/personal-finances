import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "@/config";
import type { RecaptchaService, RecaptchaVerifyResult } from "../../application/ports";

interface GoogleRecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

@Injectable()
export class GoogleRecaptchaService implements RecaptchaService {
  private readonly logger = new Logger(GoogleRecaptchaService.name);
  private readonly secretKey: string | undefined;
  private readonly minScore: number;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService<EnvConfig>) {
    this.secretKey = this.configService.get("RECAPTCHA_SECRET_KEY");
    this.minScore = this.configService.get("RECAPTCHA_MIN_SCORE") ?? 0.5;
    this.enabled = this.configService.get("RECAPTCHA_ENABLED") ?? false;
  }

  isEnabled(): boolean {
    return this.enabled && !!this.secretKey;
  }

  async verify(token: string, expectedAction: string): Promise<RecaptchaVerifyResult> {
    if (!this.isEnabled()) {
      this.logger.debug("reCAPTCHA verification skipped (disabled)");
      return { success: true, score: 1, action: expectedAction };
    }

    try {
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: this.secretKey!,
          response: token,
        }),
      });

      if (!response.ok) {
        this.logger.error(`reCAPTCHA API returned status ${response.status}`);
        // Graceful degradation: allow request through on service errors
        return { success: true, score: 1, action: expectedAction };
      }

      const data = (await response.json()) as GoogleRecaptchaResponse;

      if (!data.success) {
        this.logger.warn(`reCAPTCHA verification failed: ${data["error-codes"]?.join(", ")}`);
        return { success: false, score: 0, action: data.action ?? "" };
      }

      const score = data.score ?? 0;
      const action = data.action ?? "";

      // Validate action matches expected
      if (action !== expectedAction) {
        this.logger.warn(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${action}`);
        return { success: false, score, action };
      }

      // Validate score meets minimum threshold
      if (score < this.minScore) {
        this.logger.warn(`reCAPTCHA score too low: ${score} < ${this.minScore}`);
        return { success: false, score, action };
      }

      this.logger.debug(`reCAPTCHA verification successful: score=${score}, action=${action}`);
      return { success: true, score, action };
    } catch (error) {
      this.logger.error("reCAPTCHA verification error", error);
      // Graceful degradation: allow request through on service errors
      return { success: true, score: 1, action: expectedAction };
    }
  }
}
