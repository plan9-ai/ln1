import { randomBytes } from "node:crypto";
import { sql } from "bun";
import { appConfig } from "@/app.config";
import { ensureUserInAppDb } from "@/lib/ensure-user-in-app-db";
import { getAuthUserByEmail } from "@/lib/get-auth-user-by-email";
import { sendTeamInviteEmail } from "@/lib/resend";
import { TeamsService } from "@/modules/teams/service";

export interface TeamInviteWithMeta {
  id: number;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: number;
}

export const TeamInvitesService = {
  async createInvite(
    actorUserId: string,
    slug: string,
    email: string,
    role: "admin" | "member" | "viewer"
  ): Promise<void> {
    const actorRole = await TeamsService.getMemberRole(actorUserId, slug);
    if (actorRole !== "owner" && actorRole !== "admin") {
      throw new Error("Only owner or admin can invite members");
    }

    const [teamRow] = await sql`
      SELECT id, title FROM teams WHERE slug = ${slug}
    `;
    if (!teamRow) {
      throw new Error("Team not found");
    }
    const team = teamRow as { id: number; title: string };

    const authUser = await getAuthUserByEmail(email);
    if (!authUser) {
      throw new Error("User not found");
    }

    const [existingMember] = await sql`
      SELECT 1 FROM team_members tm
      JOIN teams t ON t.id = tm.team_id
      WHERE t.slug = ${slug} AND tm.user_id = ${authUser.id}
    `;
    if (existingMember) {
      throw new Error("User is already a member");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [duplicateInvite] = await sql`
      SELECT 1 FROM team_invites
      WHERE team_id = ${team.id}
        AND LOWER(TRIM(email)) = ${normalizedEmail}
        AND status = 'pending'
    `;
    if (duplicateInvite) {
      throw new Error("Invitation already sent to this email");
    }

    const token = randomBytes(32).toString("hex");
    const now = Math.floor(Date.now() / 1000);

    await sql`
      INSERT INTO team_invites (
        team_id, email, role, token, invited_by_user_id, status, created_at
      )
      VALUES (
        ${team.id},
        ${email.trim()},
        ${role},
        ${token},
        ${actorUserId},
        'pending',
        ${now}
      )
    `;

    const acceptUrl = `${appConfig.BASE_URL}/invite/accept?token=${token}`;
    const { error } = await sendTeamInviteEmail({
      to: email.trim(),
      teamName: team.title,
      acceptUrl,
    });
    if (error) {
      throw new Error("Failed to send invitation email");
    }
  },

  async getPendingInvitesByTeamSlug(
    userId: string,
    slug: string
  ): Promise<TeamInviteWithMeta[]> {
    const role = await TeamsService.getMemberRole(userId, slug);
    if (role !== "owner" && role !== "admin") {
      return [];
    }

    const rows = (await sql`
      SELECT ti.id, ti.email, ti.role, ti.created_at as "createdAt"
      FROM team_invites ti
      JOIN teams t ON t.id = ti.team_id
      WHERE t.slug = ${slug} AND ti.status = 'pending'
      ORDER BY ti.created_at DESC
    `) as { id: number; email: string; role: string; createdAt: number }[];

    return (Array.isArray(rows) ? rows : []).map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role as "admin" | "member" | "viewer",
      createdAt: r.createdAt,
    }));
  },

  async acceptInvite(
    userId: string,
    userEmail: string,
    token: string
  ): Promise<{ slug: string }> {
    const [invite] = await sql`
      SELECT ti.id, ti.team_id as "teamId", ti.email, ti.role
      FROM team_invites ti
      WHERE ti.token = ${token} AND ti.status = 'pending'
    `;
    if (!invite) {
      throw new Error("Invalid or expired invitation");
    }

    const inv = invite as {
      id: number;
      teamId: number;
      email: string;
      role: string;
    };

    const normalizedInviteEmail = inv.email.toLowerCase().trim();
    const normalizedUserEmail = (userEmail ?? "").toLowerCase().trim();
    if (normalizedUserEmail !== normalizedInviteEmail) {
      throw new Error("Invalid or expired invitation");
    }

    await ensureUserInAppDb(userId);

    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO team_members (user_id, team_id, role)
        VALUES (${userId}, ${inv.teamId}, ${inv.role})
        ON CONFLICT (user_id, team_id) DO UPDATE SET role = EXCLUDED.role
      `;
      await tx`
        UPDATE team_invites SET status = 'accepted' WHERE id = ${inv.id}
      `;
    });

    const [teamRow] = await sql`
      SELECT slug FROM teams WHERE id = ${inv.teamId}
    `;
    const slug = (teamRow as { slug: string } | undefined)?.slug;
    if (!slug) {
      throw new Error("Team not found");
    }
    return { slug };
  },

  async resendInvite(actorUserId: string, inviteId: number): Promise<void> {
    const [invite] = await sql`
      SELECT ti.id, ti.team_id as "teamId", ti.email, ti.role, ti.token
      FROM team_invites ti
      WHERE ti.id = ${inviteId} AND ti.status = 'pending'
    `;
    if (!invite) {
      throw new Error("Invitation not found or already accepted");
    }

    const inv = invite as {
      id: number;
      teamId: number;
      email: string;
      role: string;
      token: string;
    };

    const [teamRow] = await sql`
      SELECT slug, title FROM teams WHERE id = ${inv.teamId}
    `;
    if (!teamRow) {
      throw new Error("Team not found");
    }
    const team = teamRow as { slug: string; title: string };

    const role = await TeamsService.getMemberRole(actorUserId, team.slug);
    if (role !== "owner" && role !== "admin") {
      throw new Error("Only owner or admin can resend invitations");
    }

    const acceptUrl = `${appConfig.BASE_URL}/invite/accept?token=${inv.token}`;
    const { error } = await sendTeamInviteEmail({
      to: inv.email,
      teamName: team.title,
      acceptUrl,
    });
    if (error) {
      throw new Error("Failed to resend invitation email");
    }
  },
};
