"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { TeamInvitesService } from "@/modules/team-invites/service";
import { TeamsService } from "@/modules/teams/service";

export async function createTeamInvite(
  slug: string,
  email: string,
  role: "admin" | "member" | "viewer"
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await TeamInvitesService.createInvite(session.user.id, slug, email, role);
  revalidatePath(`/${slug}/members`);
}

export async function resendTeamInvite(
  slug: string,
  inviteId: number
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await TeamInvitesService.resendInvite(session.user.id, inviteId);
  revalidatePath(`/${slug}/members`);
}

export async function removeTeamMember(
  slug: string,
  targetUserId: string
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await TeamsService.removeMember(session.user.id, slug, targetUserId);
  revalidatePath(`/${slug}/members`);
}
