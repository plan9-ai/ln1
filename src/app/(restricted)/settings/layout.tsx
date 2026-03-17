import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getAuthSession } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";
import { TeamsService } from "@/modules/teams/service";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const teams = await TeamsService.getTeamsByUserId(session.user.id);

  if (teams.length === 0) {
    redirect("/onboarding/team");
  }

  const currentSlug = teams[0].slug;
  const projects = await ProjectsService.getProjectsByTeamSlug(
    session.user.id,
    currentSlug
  );

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
  };

  return (
    <DashboardShell
      currentSlug={currentSlug}
      projects={projects}
      teams={teams}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
