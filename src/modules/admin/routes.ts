import { Elysia } from "elysia";
import { getSessionForRequest } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function mapSupabaseUserToAppUser(u: {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  banned_until?: string | null;
  created_at?: string;
  updated_at?: string;
}) {
  const role = (u.app_metadata?.role as string | undefined) ?? null;
  const name =
    (u.user_metadata?.name as string | undefined) ??
    (u.user_metadata?.full_name as string | undefined) ??
    "";
  const image =
    (u.user_metadata?.avatar_url as string | undefined) ??
    (u.user_metadata?.picture as string | undefined) ??
    null;

  return {
    id: u.id,
    name,
    email: u.email ?? "",
    emailVerified: !!u.email_confirmed_at,
    image,
    role,
    banned: !!u.banned_until,
    banReason: null,
    banExpires: u.banned_until ? new Date(u.banned_until).getTime() : null,
    createdAt: u.created_at ?? "",
    updatedAt: u.updated_at ?? "",
  };
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/users", async ({ request }) => {
    const session = await getSessionForRequest(request);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message ?? "Failed to fetch users" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const users = (data.users ?? []).map(mapSupabaseUserToAppUser);
    return { users, total: data.users?.length ?? 0 };
  })
  .patch("/users/:id/role", async ({ params: { id }, request }) => {
    const session = await getSessionForRequest(request);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await request.json()) as { role?: "admin" | "user" };
    const { role } = body;
    if (!(role && ["admin", "user"].includes(role))) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { role },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message ?? "Failed to update role" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return { ok: true };
  })
  .post("/users/:id/ban", async ({ params: { id }, request }) => {
    const session = await getSessionForRequest(request);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "876000h",
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message ?? "Failed to ban user" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return { ok: true };
  })
  .post("/users/:id/unban", async ({ params: { id }, request }) => {
    const session = await getSessionForRequest(request);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "none",
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message ?? "Failed to unban user" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return { ok: true };
  });
