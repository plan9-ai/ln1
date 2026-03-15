"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { CreateIssueBody } from "@/modules/issues/model";
import { IssuesService } from "@/modules/issues/service";

export async function createIssue(
  slug: string,
  projectId: string,
  data: CreateIssueBody
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const projectIdNum = Number.parseInt(projectId, 10);
  if (Number.isNaN(projectIdNum)) {
    redirect(`/${slug}`);
  }

  const result = await IssuesService.createIssue(
    session.user.id,
    projectIdNum,
    data
  );
  redirect(`/${slug}/projects/${projectIdNum}/issues/${result.id}`);
}
