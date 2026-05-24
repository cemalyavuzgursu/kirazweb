import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET en az 16 karakter olmalı"),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY 64 hex karakter olmalı (32 byte)"),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default("Kiraz Tasarım <noreply@example.com>"),
  EMAIL_REPLY_TO: z.string().optional().default(""),
  IYZICO_BASE_URL: z.string().url().default("https://sandbox-api.iyzipay.com"),
  IYZICO_API_KEY: z.string().optional().default(""),
  IYZICO_SECRET: z.string().optional().default(""),
});

// SKIP_ENV_VALIDATION=1 is set in the Dockerfile builder stage where runtime
// vars are unavailable. Required fields get placeholder defaults so Next.js
// can generate static pages (robots.txt, sitemap) without crashing.
// Full validation runs at container startup when all vars are present.
const skip = process.env.SKIP_ENV_VALIDATION === "1";

const parsed = skip
  ? envSchema
      .extend({
        DATABASE_URL: z.string().default("postgresql://build-placeholder"),
        NEXTAUTH_SECRET: z.string().default("build-placeholder-secret-32chars!!"),
        ENCRYPTION_KEY: z.string().default("0".repeat(64)),
      })
      .safeParse(process.env)
  : envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Geçersiz ortam değişkenleri:", parsed.error.flatten().fieldErrors);
  throw new Error("Ortam değişkenleri doğrulanamadı.");
}

export const env = parsed.data as z.infer<typeof envSchema>;
