import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";
import { TeamsService } from "@/modules/teams/service";

export default async function TeamSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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

  return (
    <DashboardShell currentSlug={slug} projects={projects} teams={teams}>
      {children}
    </DashboardShell>
  );
}
