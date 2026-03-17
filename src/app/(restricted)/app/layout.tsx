import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { TeamsService } from "@/modules/teams/service";

export default async function AppLayout(_: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const teams = await TeamsService.getTeamsByUserId(session.user.id);

  if (teams.length === 0) {
    redirect("/onboarding/team");
  }

  redirect(`/${teams[0].slug}`);
}
