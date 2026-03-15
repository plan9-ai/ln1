"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ProjectsInsert } from "@/db/schema/projects";
import { auth } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";

export async function createProject(
  teamSlug: string,
  data: Pick<ProjectsInsert, "title" | "description">
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  await ProjectsService.createProject(session.user.id, teamSlug, data);
  redirect(`/${teamSlug}`);
}
