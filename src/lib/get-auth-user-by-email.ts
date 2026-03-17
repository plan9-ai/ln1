import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthUser {
  id: string;
  email: string;
}

export async function getAuthUserByEmail(
  email: string
): Promise<AuthUser | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const normalizedEmail = email.toLowerCase().trim();
  const user = (data.users ?? []).find(
    (u) => u.email?.toLowerCase().trim() === normalizedEmail
  );

  return user ? { id: user.id, email: user.email ?? "" } : null;
}

export async function getAuthUsersByIds(
  ids: string[]
): Promise<Map<string, string>> {
  if (ids.length === 0) {
    return new Map();
  }

  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const map = new Map<string, string>();
  const idSet = new Set(ids);
  for (const user of data.users ?? []) {
    if (idSet.has(user.id) && user.email) {
      map.set(user.id, user.email);
    }
  }
  return map;
}
