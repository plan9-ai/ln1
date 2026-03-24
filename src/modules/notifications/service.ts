import { sql } from "bun";
import { appConfig } from "@/app.config";
import { sendTeamMemberAddedEmail } from "@/lib/resend";

export const NOTIFICATION_KIND_TEAM_JOINED = "team_joined" as const;

export function teamEntityKey(teamId: number): string {
  return `teams-${teamId}`;
}

export async function createNotification(params: {
  userId: string;
  entityKey: string;
  kind: string;
}): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await sql`
    INSERT INTO notifications (user_id, entity_key, kind, created_at)
    VALUES (${params.userId}, ${params.entityKey}, ${params.kind}, ${now})
  `;
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
  });
  const teamUrl = `${appConfig.BASE_URL}/${params.teamSlug}`;
  await sendTeamMemberAddedEmail({
    to: params.toEmail,
    teamName: params.teamName,
    teamUrl,
  });
}
