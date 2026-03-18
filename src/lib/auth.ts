import type { CookieMethodsServer } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appConfig } from "@/app.config";
import { ensureUserInAppDb } from "@/lib/ensure-user-in-app-db";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string | null;
}

export interface AuthSession {
  user: AuthUser;
}

function toAuthSession(session: {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
}): AuthSession {
  const user = session.user;
  const role = (user.app_metadata?.role as string | undefined) ?? null;
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name:
        ((user.user_metadata?.name ?? user.user_metadata?.full_name) as
          | string
          | null) ?? null,
      image:
        ((user.user_metadata?.avatar_url ?? user.user_metadata?.picture) as
          | string
          | null) ?? null,
      role,
    },
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
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
  const supabase = createServerClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_ANON_KEY,
    { cookies: cookiesOptions }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureUserInAppDb(user.id);
  return toAuthSession({ user });
}

function parseCookies(
  cookieHeader: string | null
): { name: string; value: string }[] {
  if (!cookieHeader) {
    return [];
  }
  return cookieHeader
    .split(";")
    .map((part) => {
      const [name, ...valueParts] = part.trim().split("=");
      return {
        name: name ?? "",
        value: valueParts.join("=").trim(),
      };
    })
    .filter((c) => c.name);
}

export async function getSessionForRequest(
  request: Request
): Promise<AuthSession | null> {
  const cookieHeader = request.headers.get("Cookie");
  const cookieList = parseCookies(cookieHeader);

  const cookiesOptions: CookieMethodsServer = {
    getAll() {
      return cookieList;
    },
    setAll() {
      // No-op for API route context
    },
  };
  const supabase = createServerClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_ANON_KEY,
    { cookies: cookiesOptions }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await ensureUserInAppDb(user.id);
  return toAuthSession({ user });
}
