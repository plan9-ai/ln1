import type { CookieMethodsServer } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appConfig } from "@/app.config";

export async function createClient() {
  const cookieStore = await cookies();
  const cookiesOptions: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(
            name,
            value,
            options as Parameters<typeof cookieStore.set>[2]
          );
        }
      } catch {
        // Ignored if called from Server Component
      }
    },
  };

  return createServerClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_ANON_KEY,
    { cookies: cookiesOptions }
  );
}
