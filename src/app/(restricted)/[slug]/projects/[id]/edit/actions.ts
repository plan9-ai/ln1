"use server";

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import type { InferUpdateProjectFormSchema } from "@/modules/projects/model";
import { ProjectsService } from "@/modules/projects/service";

export async function updateProject(
  slug: string,
  projectId: number,
  data: InferUpdateProjectFormSchema
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  await ProjectsService.updateProject(session.user.id, projectId, data);
}
