import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = path.join(backendRoot, "..");

/** Load parent .env first, then backend/.env overrides (backend wins). */
dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const stripEnv = (val: unknown): string | undefined => {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim().replace(/^["']|["']$/g, "");
  return s.length > 0 ? s : undefined;
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1).default("default_dev_secret_replace_in_prod"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
  PUBLIC_API_URL: z.string().default("http://localhost:8080"),
  SMTP_HOST: z.preprocess(stripEnv, z.string().optional()),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .preprocess(
      (val) => val === true || val === "true",
      z.boolean().optional()
    )
    .optional()
    .default(false),
  SMTP_USER: z.preprocess(stripEnv, z.string().optional()),
  SMTP_PASS: z.preprocess(stripEnv, z.string().optional()),
  EMAIL_FROM: z.preprocess(stripEnv, z.string().optional()),
  RESEND_API_KEY: z.preprocess(stripEnv, z.string().optional())
});

const parsed = envSchema.parse(process.env);

/** EMAIL_FROM defaults to SMTP_USER so Gmail only needs user + app password. */
export const env = {
  ...parsed,
  EMAIL_FROM: parsed.EMAIL_FROM ?? parsed.SMTP_USER
};

const smtpConfigured = Boolean(env.SMTP_USER?.trim() && env.SMTP_PASS?.trim());
if (smtpConfigured) {
  console.log("[email] smtp_loaded", {
    host: env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: env.SMTP_PORT ?? 587,
    user: env.SMTP_USER!.trim(),
    from: (env.EMAIL_FROM?.trim() || env.SMTP_USER!.trim())
  });
} else if (env.RESEND_API_KEY?.trim()) {
  console.log("[email] resend_loaded", { from: env.EMAIL_FROM?.trim() || "(default)" });
}
