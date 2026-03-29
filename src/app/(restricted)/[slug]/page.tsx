import { IssuesTableAggregated } from "@/components/issues-table-aggregated";
import { NewIssueButton } from "@/components/new-issue-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { IssuesService } from "@/modules/issues/service";
import { ProjectsService } from "@/modules/projects/service";

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const { slug } = await params;
  const [issues, projects] = await Promise.all([
    IssuesService.getIssuesByTeamSlug(session.user.id, slug),
    ProjectsService.getProjectsByTeamSlug(session.user.id, slug),
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
              <BreadcrumbItem>
                <BreadcrumbPage>Issues</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col pt-0 pb-4">
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-2xl">Issues</h1>
              <p className="text-muted-foreground text-sm">
                All issues in this team
              </p>
            </div>
            <NewIssueButton projects={projects} />
          </div>
          <IssuesTableAggregated issues={issues} />
        </div>
      </div>
    </>
  );
}
