"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { CreateTeamBody } from "@/modules/teams/model";
import { TeamsService } from "@/modules/teams/service";

export async function createTeam(data: CreateTeamBody): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const result = await TeamsService.createTeam(session.user.id, data);
  redirect(`/${result.slug}`);
}
