"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectsInsert } from "@/db/schema/projects";
import { getAuthSession } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";

export async function createProject(
  teamSlug: string,
  data: Pick<ProjectsInsert, "title" | "description">
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  await ProjectsService.createProject(session.user.id, teamSlug, data);
  revalidatePath(`/${teamSlug}`, "layout");
  redirect(`/${teamSlug}`);
}
