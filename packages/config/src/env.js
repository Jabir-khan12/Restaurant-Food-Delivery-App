import { z } from 'zod';

// ─── Server Environment Schema ────────────────────────────────────────────────

export const serverEnvSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_URL: z.string().url().default('http://localhost:5000'),

  // Client URLs (CORS)
  WEB_URL: z.string().url().default('http://localhost:5173'),
  ADMIN_URL: z.string().url().default('http://localhost:5174'),

  // MongoDB
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PUBLISHABLE_KEY: z.string().default(''),

  // Email (Resend / SendGrid / SMTP)
  MAIL_PROVIDER: z.enum(['resend', 'sendgrid', 'smtp']).default('resend'),
  MAIL_API_KEY: z.string().default(''),
  MAIL_FROM: z.string().email().default('noreply@flavourfleet.com'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Misc
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  ORDER_AUTO_CANCEL_MINS: z.coerce.number().default(5),
  RIDER_HEARTBEAT_TIMEOUT_SECS: z.coerce.number().default(60),
});

// ─── Client Environment Schema ────────────────────────────────────────────────

export const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:5000'),
  VITE_WS_URL: z.string().default('http://localhost:5000'),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  VITE_GOOGLE_MAPS_API_KEY: z.string().default(''),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().default(''),
});

// ─── Validation Helper ────────────────────────────────────────────────────────

export function validateEnv(schema, env = process.env) {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check the logs above.');
  }
  return result.data;
}
