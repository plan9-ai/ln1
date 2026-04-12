import { sql } from "bun";
import { appConfig } from "@/app.config";
import type { notificationsTable } from "@/db/schema/notifications";
import { sendIssueAssigneeEmail, sendTeamMemberAddedEmail } from "@/lib/resend";

type Notification = typeof notificationsTable.$inferSelect;

export const NOTIFICATION_KIND_TEAM_JOINED = "team_joined" as const;
export const NOTIFICATION_KIND_ISSUE_ASSIGNED = "issue_assigned" as const;
export const NOTIFICATION_KIND_ISSUE_COMMENTED = "issue_commented" as const;

export function teamEntityKey(teamId: number): string {
  return `teams-${teamId}`;
}

export function issueEntityKey(issueId: number): string {
  return `issues-${issueId}`;
}

export async function getNotificationsForUser(
  userId: string
): Promise<Notification[]> {
  const rows = await sql`
    SELECT id, user_id AS "userId", entity_key AS "entityKey", kind,
           payload, created_at AS "createdAt", read_at AS "readAt"
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return (rows ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    payload:
      typeof r.payload === "string" ? JSON.parse(r.payload) : (r.payload ?? null),
  })) as Notification[];
}

export async function createNotification(params: {
  userId: string;
  entityKey: string;
  kind: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const payloadJson = params.payload ? JSON.stringify(params.payload) : "{}";
  await sql`
    INSERT INTO notifications (user_id, entity_key, kind, payload, created_at)
    VALUES (${params.userId}, ${params.entityKey}, ${params.kind}, ${payloadJson}::jsonb, ${now})
  `;
}

export async function notifyIssueAssigned(params: {
  userId: string;
  toEmail: string;
  teamSlug: string;
  projectId: number;
  issueId: number;
  issueTitle: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    entityKey: issueEntityKey(params.issueId),
    kind: NOTIFICATION_KIND_ISSUE_ASSIGNED,
    payload: {
      issueId: params.issueId,
      issueTitle: params.issueTitle,
      projectId: params.projectId,
      teamSlug: params.teamSlug,
    },
  });
  const issueUrl = `${appConfig.BASE_URL}/${params.teamSlug}/projects/${params.projectId}/issues/${params.issueId}`;
  await sendIssueAssigneeEmail({
    to: params.toEmail,
    issueTitle: params.issueTitle,
    issueUrl,
  });
}

export async function notifyIssueCommented(params: {
  userId: string;
  teamSlug: string;
  projectId: number;
  issueId: number;
  issueTitle: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    entityKey: issueEntityKey(params.issueId),
    kind: NOTIFICATION_KIND_ISSUE_COMMENTED,
    payload: {
      issueId: params.issueId,
      issueTitle: params.issueTitle,
      projectId: params.projectId,
      teamSlug: params.teamSlug,
    },
  });
}

export async function notifyTeamMemberJoined(params: {
  userId: string;
  toEmail: string;
  teamId: number;
  teamSlug: string;
  teamName: string;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    entityKey: teamEntityKey(params.teamId),
    kind: NOTIFICATION_KIND_TEAM_JOINED,
    payload: {
      teamId: params.teamId,
      teamSlug: params.teamSlug,
      teamName: params.teamName,
    },
  });
  const teamUrl = `${appConfig.BASE_URL}/${params.teamSlug}`;
  await sendTeamMemberAddedEmail({
    to: params.toEmail,
    teamName: params.teamName,
    teamUrl,
  });
}
