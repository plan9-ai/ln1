/**
 * @link https://www.better-auth.com/docs/installation
 */

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { appConfig } from "@/app.config";
import { ensureUserInAppDb } from "@/lib/ensure-user-in-app-db";

export const auth = betterAuth({
  database: new Pool({
    connectionString: appConfig.BETTER_AUTH_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    allowExitOnIdle: true,
    keepAlive: true,
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log("user", user);
          await ensureUserInAppDb(user.id);
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    admin({
      adminUserIds: [],
    }),
  ],
});
