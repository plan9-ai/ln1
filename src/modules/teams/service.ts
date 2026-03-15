import { sql } from "bun";
import {
  getAuthUserByEmail,
  getAuthUsersByIds,
} from "@/lib/get-auth-user-by-email";
import { ensureUserInAppDb } from "@/lib/ensure-user-in-app-db";
import type { CreateTeamBody, TeamWithRole } from "./model";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface TeamMemberWithEmail {
  userId: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export const TeamsService = {
  async getTeamBySlug(slug: string): Promise<{ id: number } | null> {
    const [row] = await sql`
      SELECT id FROM teams WHERE slug = ${slug}
    `;
    return (row ?? null) as { id: number } | null;
  },

  async getMembersByTeamSlug(
    userId: string,
    slug: string
  ): Promise<TeamMemberWithEmail[]> {
    const currentMember = await this.getMemberRole(userId, slug);
    if (!currentMember) {
      return [];
    }

    const rows = (await sql`
      SELECT tm.user_id as "userId", tm.role
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE t.slug = ${slug}
    `) as { userId: string; role: "owner" | "admin" | "member" | "viewer" }[];

    const ids = Array.isArray(rows) ? rows.map((r) => r.userId) : [];
    const emailMap = await getAuthUsersByIds(ids);

    return (Array.isArray(rows) ? rows : []).map((r) => ({
      userId: r.userId,
      email: emailMap.get(r.userId) ?? r.userId,
      role: r.role,
    }));
  },

  async getMemberRole(
    userId: string,
    slug: string
  ): Promise<"owner" | "admin" | "member" | "viewer" | null> {
    const [row] = await sql`
      SELECT tm.role
      FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE t.slug = ${slug} AND tm.user_id = ${userId}
    `;
    return (row?.role ?? null) as "owner" | "admin" | "member" | "viewer" | null;
  },

  async addMember(
    actorUserId: string,
    slug: string,
    email: string,
    role: "admin" | "member" | "viewer"
  ): Promise<void> {
    const actorRole = await this.getMemberRole(actorUserId, slug);
    if (actorRole !== "owner" && actorRole !== "admin") {
      throw new Error("Only owner or admin can add members");
    }

    const team = await this.getTeamBySlug(slug);
    if (!team) {
      throw new Error("Team not found");
    }

    const authUser = await getAuthUserByEmail(email);
    if (!authUser) {
      throw new Error("User not found");
    }

    await ensureUserInAppDb(authUser.id);

    await sql`
      INSERT INTO team_members (user_id, team_id, role)
      VALUES (${authUser.id}, ${team.id}, ${role})
      ON CONFLICT (user_id, team_id) DO UPDATE SET role = EXCLUDED.role
    `;
  },

  async removeMember(
    actorUserId: string,
    slug: string,
    targetUserId: string
  ): Promise<void> {
    const actorRole = await this.getMemberRole(actorUserId, slug);
    if (!actorRole) {
      throw new Error("Not a team member");
    }

    const [target] = await sql`
      SELECT role FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE t.slug = ${slug} AND tm.user_id = ${targetUserId}
    `;
    if (!target) {
      throw new Error("Member not found");
    }

    if (target.role === "owner") {
      throw new Error("Cannot remove owner");
    }

    const canRemove =
      actorUserId === targetUserId ||
      actorRole === "owner" ||
      actorRole === "admin";

    if (!canRemove) {
      throw new Error("Cannot remove this member");
    }

    await sql`
      DELETE FROM team_members
      WHERE user_id = ${targetUserId}
        AND team_id = (SELECT id FROM teams WHERE slug = ${slug})
    `;
  },

  async getTeamsByUserId(userId: string): Promise<TeamWithRole[]> {
    const result = await sql`
      SELECT t.id, t.title, t.slug, t.description, tm.role
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ${userId}
      ORDER BY t.title ASC
    `;
    return (Array.isArray(result) ? result : []) as TeamWithRole[];
  },

  async createTeam(
    userId: string,
    data: CreateTeamBody
  ): Promise<TeamWithRole> {
    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const slug = data.slug?.toLowerCase().trim() ?? "";
    if (!slug) {
      throw new Error("Slug is required");
    }
    if (!SLUG_REGEX.test(slug)) {
      throw new Error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    const [existing] = await sql`
      SELECT id FROM teams WHERE slug = ${slug}
    `;
    if (existing) {
      throw new Error("A team with this slug already exists");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    const teamData = {
      owner_user_id: userId,
      title,
      slug,
      description,
      created_at: now,
      updated_at: now,
    };

    const [team] = await sql.begin(async (tx) => {
      const [inserted] = await tx`
        INSERT INTO teams ${sql(teamData)}
        RETURNING id, title, slug, description
      `;
      if (!inserted) {
        throw new Error("Failed to create team");
      }
      await tx`
        INSERT INTO team_members ${sql({
          user_id: userId,
          team_id: inserted.id,
          role: "owner",
        })}
      `;
      return [{ ...inserted, role: "owner" as const }];
    });
    if (!team) {
      throw new Error("Failed to create team");
    }
    return team as TeamWithRole;
  },
};
