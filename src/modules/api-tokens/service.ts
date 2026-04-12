import { randomUUID } from "node:crypto";
import { sql } from "bun";

interface ApiToken {
  id: number;
  userId: string;
  token: string;
  name: string;
  createdAt: number;
}

export const ApiTokensService = {
  async getTokensByUserId(userId: string): Promise<ApiToken[]> {
    const rows = await sql`
      SELECT id, user_id AS "userId", token, name, created_at AS "createdAt"
      FROM api_tokens
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return (rows ?? []) as ApiToken[];
  },

  async createToken(userId: string, name: string): Promise<ApiToken> {
    const token = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const [row] = await sql`
      INSERT INTO api_tokens (user_id, token, name, created_at)
      VALUES (${userId}, ${token}, ${name}, ${now})
      RETURNING id, user_id AS "userId", token, name, created_at AS "createdAt"
    `;
    return row as ApiToken;
  },

  async deleteToken(userId: string, tokenId: number): Promise<void> {
    await sql`
      DELETE FROM api_tokens
      WHERE id = ${tokenId} AND user_id = ${userId}
    `;
  },

  async getUserIdByToken(token: string): Promise<string | null> {
    const [row] = await sql`
      SELECT user_id AS "userId"
      FROM api_tokens
      WHERE token = ${token}
      LIMIT 1
    `;
    return (row?.userId as string) ?? null;
  },
};
