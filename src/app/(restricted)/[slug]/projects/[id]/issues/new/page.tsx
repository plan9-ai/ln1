import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CreateIssueForm } from "@/components/create-issue-form";
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
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import { ProjectsService } from "@/modules/projects/service";

export default async function NewIssuePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const session = await getAuthSession();
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

  const projectStatuses = await ProjectStatusesService.getStatusesByProjectId(
    session.user.id,
    projectId
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
                <BreadcrumbLink href={`/${slug}/projects/new`}>
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
                <BreadcrumbPage>Create issue</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-semibold text-2xl">Create a new issue</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Add an issue to track work, bugs, or feature requests in this
              project.
            </p>
          </div>
          <CreateIssueForm
            projectId={id}
            projectStatuses={projectStatuses}
            slug={slug}
          />
        </div>
      </div>
    </>
  );
}
