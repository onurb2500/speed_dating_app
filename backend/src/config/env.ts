import { z } from "zod";

/**
 * The ONLY place in the codebase where `process.env` is read.
 * Every variable is validated at startup; the process crashes (exit 1)
 * if a required variable is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // RS256 PEM keys. Allow literal "\n" sequences (common in .env files).
  JWT_PRIVATE_KEY: z
    .string()
    .min(1)
    .transform((v) => v.replace(/\\n/g, "\n")),
  JWT_PUBLIC_KEY: z
    .string()
    .min(1)
    .transform((v) => v.replace(/\\n/g, "\n")),
  REFRESH_TOKEN_SECRET: z.string().min(32),

  MUX_TOKEN_ID: z.string().min(1),
  MUX_TOKEN_SECRET: z.string().min(1),
  MUX_WEBHOOK_SECRET: z.string().min(1),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((v) =>
      v
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    // Intentional stderr write: this runs before the logger is available
    // and must surface the misconfiguration before the process exits.
    process.stderr.write(
      `\n❌ Invalid environment configuration:\n${issues}\n\n`,
    );
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
