import { sql } from "bun";
import type { AuthSession } from "@/lib/auth";

export async function authEnsureSession(
  getSession: () => Promise<AuthSession | null>
): Promise<AuthSession> {
  const session = await getSession();
  if (session == null) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function ensureUserInAppDb(userId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO users (id)
      VALUES (${userId})
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (err) {
    console.error("Failed to sync user to app database", err);
    throw new Error("Failed to sync user to app database", { cause: err });
  }
}
