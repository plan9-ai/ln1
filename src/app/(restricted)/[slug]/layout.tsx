import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getAuthSession } from "@/lib/auth";
import { IssuesService } from "@/modules/issues/service";
import { ProjectsService } from "@/modules/projects/service";
import { TeamsService } from "@/modules/teams/service";

export default async function TeamSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const teams = await TeamsService.getTeamsByUserId(session.user.id);

  if (teams.length === 0) {
    redirect("/onboarding/team");
  }

  const { slug } = await params;
  const hasAccess = teams.some((t) => t.slug === slug);
  if (!hasAccess) {
    redirect(`/${teams[0].slug}`);
  }

  const projects = await ProjectsService.getProjectsByTeamSlug(
    session.user.id,
    slug
  );

  const myIssuesCount = await IssuesService.getActiveIssueCountForUser(
    session.user.id
  );

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
  };

  return (
    <DashboardShell
      currentSlug={slug}
      myIssuesCount={myIssuesCount}
      projects={projects}
      teams={teams}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}
