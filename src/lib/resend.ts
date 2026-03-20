import { Resend } from "resend";
import { appConfig } from "@/app.config";

const resend = new Resend(appConfig.RESEND_API_KEY);

export async function sendTeamInviteEmail(params: {
  to: string;
  teamName: string;
  acceptUrl: string;
}): Promise<{ error: Error | null }> {
  const { error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [params.to],
    subject: `You're invited to join ${params.teamName}`,
    html: `
      <p>You've been invited to join <strong>${params.teamName}</strong> on LN1.</p>
      <p><a href="${params.acceptUrl}">Accept invitation</a></p>
    `,
  });
  return { error: error ?? null };
}

export async function sendIssueAssigneeEmail(params: {
  to: string;
  issueTitle: string;
  issueUrl: string;
}): Promise<{ error: Error | null }> {
  const { error } = await resend.emails.send({
    from: `LN1 <${appConfig.RESEND_FROM_EMAIL}>`,
    to: [params.to],
    subject: `You were assigned: ${params.issueTitle}`,
    html: `
      <p>You were assigned to <strong>${params.issueTitle}</strong> on LN1.</p>
      <p><a href="${params.issueUrl}">Open issue</a></p>
    `,
  });
  return { error: error ?? null };
}
