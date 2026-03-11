import { z } from "zod";

const AI_PROVIDERS = ["groq", "gemini", "openai", "anthropic"] as const;

const envSchema = z
  .object({
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

    // AI Invoice Scanner
    AI_INVOICE_PROVIDER: z.enum(AI_PROVIDERS).default("groq"),
    GROQ_API_KEY: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const provider = data.AI_INVOICE_PROVIDER;
    const keyMap: Record<(typeof AI_PROVIDERS)[number], string | undefined> = {
      groq: data.GROQ_API_KEY,
      gemini: data.GEMINI_API_KEY,
      openai: data.OPENAI_API_KEY,
      anthropic: data.ANTHROPIC_API_KEY,
    };

    if (!keyMap[provider]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${provider.toUpperCase()}_API_KEY is required when AI_INVOICE_PROVIDER is "${provider}"`,
        path: [`${provider.toUpperCase()}_API_KEY`],
      });
    }
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
