"use server";

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import type { UpdateIssueBody } from "@/modules/issues/model";
import { IssuesService } from "@/modules/issues/service";

export async function updateIssue(
  slug: string,
  projectId: string,
  issueId: string,
  data: UpdateIssueBody
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const projectIdNum = Number.parseInt(projectId, 10);
  if (Number.isNaN(projectIdNum)) {
    redirect(`/${slug}`);
  }

  const issueIdNum = Number.parseInt(issueId, 10);
  if (Number.isNaN(issueIdNum)) {
    redirect(`/${slug}/projects/${projectIdNum}/issues`);
  }

  await IssuesService.updateIssue(session.user.id, issueIdNum, data);
  redirect(`/${slug}/projects/${projectIdNum}/issues/${issueIdNum}`);
}
