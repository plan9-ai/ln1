import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IssuesKanban } from "@/components/issues-kanban";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { IssuesService } from "@/modules/issues/service";
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import { ProjectsService } from "@/modules/projects/service";

export default async function IssuesKanbanPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }

  const { slug, id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  const project = await ProjectsService.getProjectById(
    session.user.id,
    projectId
  );
  if (!project) {
    notFound();
  }

  const [initialIssues, initialStatuses] = await Promise.all([
    IssuesService.getIssuesByProjectId(session.user.id, projectId),
    ProjectStatusesService.getStatusesByProjectId(session.user.id, projectId),
  ]);

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
                <BreadcrumbLink href={`/${slug}/projects/new`}>
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects/${id}`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${slug}/projects/${id}/issues`}>
                  Issues
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Kanban</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col pt-0 pb-4">
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <div className="flex flex-row items-center justify-between gap-4">
            <h1 className="font-semibold text-2xl">Kanban board</h1>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/${slug}/projects/${id}/issues`}>Table view</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/${slug}/projects/${id}/issues/new`}>
                  New issue
                </Link>
              </Button>
            </div>
          </div>
          <IssuesKanban
            fallbackData={initialIssues}
            projectId={id}
            slug={slug}
            statuses={initialStatuses}
          />
        </div>
      </div>
    </>
  );
}
