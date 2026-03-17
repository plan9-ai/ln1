"use server";

import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import type { CreateTeamBody } from "@/modules/teams/model";
import { TeamsService } from "@/modules/teams/service";

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function createTeam(
  data: CreateTeamBody | FormData
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const body: CreateTeamBody =
    data instanceof FormData
      ? {
          title: (data.get("title") as string) ?? "",
          slug: slugFromTitle((data.get("title") as string) ?? ""),
          description: (data.get("description") as string) ?? undefined,
        }
      : data;

  const result = await TeamsService.createTeam(session.user.id, body);
  redirect(`/${result.slug}`);
}
