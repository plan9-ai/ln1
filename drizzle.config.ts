// Do not remove: drizzle-kit is a standalone CLI and does not inherit Bun's
// automatic .env.local loading, so it needs dotenv to populate process.env
// before @/app.config runs its ensureString() checks.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { appConfig } from "@/app.config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: appConfig.DATABASE_URL,
  },
});
