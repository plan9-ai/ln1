import { Resend } from "resend";
import { appConfig } from "@/app.config";
import { logger } from "@/lib/logger";

const resend = new Resend(appConfig.RESEND_API_KEY);

export async function sendTeamInviteEmail(params: {
  to: string;
  teamName: string;
  acceptUrl: string;
}): Promise<{ error: Error | null }> {
  const { data, error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [params.to],
    subject: `You're invited to join ${params.teamName}`,
    html: `
      <p>You've been invited to join <strong>${params.teamName}</strong> on LN1.</p>
      <p><a href="${params.acceptUrl}">Accept invitation</a></p>
    `,
  });
  if (!error) {
    logger.info(
      {
        emailKind: "team_invite",
        to: params.to,
        teamName: params.teamName,
        resendId: data?.id,
      },
      "email sent"
    );
  }
  return { error: error ?? null };
}

export async function sendIssueAssigneeEmail(params: {
  to: string;
  issueTitle: string;
  issueUrl: string;
}): Promise<{ error: Error | null }> {
  const { data, error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [params.to],
    subject: `You were assigned: ${params.issueTitle}`,
    html: `
      <p>You were assigned to <strong>${params.issueTitle}</strong> on LN1.</p>
      <p><a href="${params.issueUrl}">Open issue</a></p>
    `,
  });
  if (!error) {
    logger.info(
      {
        emailKind: "issue_assignee",
        to: params.to,
        issueTitle: params.issueTitle,
        resendId: data?.id,
      },
      "email sent"
    );
  }
  return { error: error ?? null };
}

export async function sendTeamMemberAddedEmail(params: {
  to: string;
  teamName: string;
  teamUrl: string;
}): Promise<{ error: Error | null }> {
  const { data, error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [params.to],
    subject: `You joined ${params.teamName}`,
    html: `
      <p>You were added to <strong>${params.teamName}</strong> on LN1.</p>
      <p><a href="${params.teamUrl}">Open team</a></p>
    `,
  });
  if (!error) {
    logger.info(
      {
        emailKind: "team_member_added",
        to: params.to,
        teamName: params.teamName,
        resendId: data?.id,
      },
      "email sent"
    );
  }
  return { error: error ?? null };
}
