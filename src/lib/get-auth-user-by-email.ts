import { Pool } from "pg";
import { appConfig } from "@/app.config";

let authPool: Pool | null = null;

function getAuthPool(): Pool {
  if (!authPool) {
    authPool = new Pool({
      connectionString: appConfig.BETTER_AUTH_DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
      allowExitOnIdle: true,
      keepAlive: true,
    });
  }
  return authPool;
}

export interface AuthUser {
  id: string;
  email: string;
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const pool = getAuthPool();
  const result = await pool.query<{ id: string; email: string }>(
    'SELECT id, email FROM "user" WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
    [email]
  );
  const row = result.rows[0];
  return row ? { id: row.id, email: row.email } : null;
}

export async function getAuthUsersByIds(
  ids: string[]
): Promise<Map<string, string>> {
  if (ids.length === 0) {
    return new Map();
  }
  const pool = getAuthPool();
  const result = await pool.query<{ id: string; email: string }>(
    'SELECT id, email FROM "user" WHERE id = ANY($1::text[])',
    [ids]
  );
  const map = new Map<string, string>();
  for (const row of result.rows) {
    map.set(row.id, row.email);
  }
  return map;
}
