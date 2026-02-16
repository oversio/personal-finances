import { z } from "zod";

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.url(),

  // Frontend
  FRONTEND_URL: z.url(),

  // Resend (Email)
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email().default("info@omasolutions.cl"),

  // App
  PORT: z.coerce.number().default(9000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: z.string().min(1).optional(),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.5),
  RECAPTCHA_ENABLED: z.coerce.boolean().default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}
