import { notFound } from "next/navigation";
import { EditIssueForm } from "@/components/edit-issue-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { IssuesService } from "@/modules/issues/service";
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import { ProjectsService } from "@/modules/projects/service";
import { TeamsService } from "@/modules/teams/service";

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ slug: string; id: string; issueId: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const { slug, id, issueId } = await params;
  const issueIdNum = Number.parseInt(issueId, 10);
  if (Number.isNaN(issueIdNum)) {
    notFound();
  }

  const issue = await IssuesService.getIssueById(session.user.id, issueIdNum);
  if (!issue) {
    notFound();
  }

  const project = await ProjectsService.getProjectById(
    session.user.id,
    issue.projectId
  );
  if (!project) {
    notFound();
  }

  const projectStatuses = await ProjectStatusesService.getStatusesByProjectId(
    session.user.id,
    issue.projectId
  );

  const teamMembers = await TeamsService.getMembersByTeamSlug(
    session.user.id,
    slug
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects`}>
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects/${id}/issues`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit issue</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-semibold text-2xl">Edit issue</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Update the title, description, or status of this issue.
            </p>
          </div>
          <EditIssueForm
            issue={issue}
            projectId={id}
            projectStatuses={projectStatuses}
            slug={slug}
            teamMembers={teamMembers}
          />
        </div>
      </div>
    </>
  );
}
