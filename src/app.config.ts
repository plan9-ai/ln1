import "dotenv/config";
import { ensureString } from "@/lib/utils";

const DATABASE_URL = ensureString("DATABASE_URL");
const BETTER_AUTH_SECRET = ensureString("BETTER_AUTH_SECRET");
const BETTER_AUTH_URL = ensureString("BETTER_AUTH_URL");
const BETTER_AUTH_DATABASE_URL = ensureString("BETTER_AUTH_DATABASE_URL");

export const appConfig = {
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  BETTER_AUTH_DATABASE_URL,
};
