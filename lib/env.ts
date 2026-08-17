import "server-only";

import { envSchema } from "./env.schema";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error(
    "Invalid environment variables. Compare your .env file against .env.example.",
  );
}

export const env = parsed.data;
