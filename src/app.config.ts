import "dotenv/config";
import { ensureString } from "@/lib/utils";

const DATABASE_URL = ensureString("DATABASE_URL");
const SUPABASE_ANON_KEY = ensureString("SUPABASE_ANON_KEY");
const SUPABASE_UPLOADS_BUCKET = ensureString("SUPABASE_UPLOADS_BUCKET");
const SUPABASE_URL = ensureString("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = ensureString("SUPABASE_SERVICE_ROLE_KEY");

export const appConfig = {
  DATABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_UPLOADS_BUCKET,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
};
