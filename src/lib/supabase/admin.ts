import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/app.config";

export function createAdminClient() {
  return createClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
