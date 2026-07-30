import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // Server-side environment variables
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    BETTER_AUTH_SECRET: z.string(),
    MODAL_KEY: z.string(),
    MODAL_SECRET: z.string(),

    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_REGION: z.string(),
    S3_BUCKET_NAME: z.string(),

    GENERATE_WITH_LYRICS: z.string().url(),
    GENERATE_FROM_DESCRIPTION: z.string().url(),
    GENERATE_FROM_DESCRIBED_LYRICS: z.string().url(),
    INNGEST_DEV: z.coerce.boolean().default(false),
    INNGEST_EVENT_KEY: z.string().optional(),
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
  },

  // Client-side env vars (if needed, must be prefixed with NEXT_PUBLIC_)
  client: {},

  // Map process.env variables
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    MODAL_KEY: process.env.MODAL_KEY,
    MODAL_SECRET: process.env.MODAL_SECRET,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,

    GENERATE_WITH_LYRICS: process.env.GENERATE_WITH_LYRICS,
    GENERATE_FROM_DESCRIPTION: process.env.GENERATE_FROM_DESCRIPTION,
    GENERATE_FROM_DESCRIBED_LYRICS: process.env.GENERATE_FROM_DESCRIBED_LYRICS,
    INNGEST_DEV: process.env.INNGEST_DEV,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
