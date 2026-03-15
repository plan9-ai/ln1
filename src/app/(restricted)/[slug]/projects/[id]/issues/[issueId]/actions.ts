"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { InsertCommentBody } from "@/db/schema/issue-comments";
import { auth } from "@/lib/auth";
import { CommentsService } from "@/modules/comments/service";

export async function insertComment(
  slug: string,
  projectId: string,
  issueId: string,
  data: InsertCommentBody
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const issueIdNum = Number.parseInt(issueId, 10);
  if (Number.isNaN(issueIdNum)) {
    redirect(`/${slug}`);
  }

  const projectIdNum = Number.parseInt(projectId, 10);
  if (Number.isNaN(projectIdNum)) {
    redirect(`/${slug}`);
  }

  await CommentsService.insertComment(session.user.id, issueIdNum, data);
  revalidatePath(`/${slug}/projects/${projectIdNum}/issues/${issueIdNum}`);
}
