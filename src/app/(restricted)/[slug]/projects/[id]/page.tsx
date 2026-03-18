import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getAuthSession } from "@/lib/auth";
import { ProjectsService } from "@/modules/projects/service";

export default async function ProjectPage({
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
              <BreadcrumbItem>
                <BreadcrumbPage>{project.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="font-semibold text-2xl">{project.title}</h1>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/${slug}/projects/${id}/issues`}>Issues</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/${slug}/projects/${id}/issues/new`}>New issue</Link>
            </Button>
          </div>
        </div>
        {project.description && (
          <p className="mt-2 text-muted-foreground text-sm">
            {project.description}
          </p>
        )}
      </div>
    </>
  );
}
