import { IssuesTableAggregated } from "@/components/issues-table-aggregated";
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

export default async function IssuesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const { slug } = await params;
  const issues = await IssuesService.getAllIssuesForUser(session.user.id);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
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
                <BreadcrumbPage>Issues</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col pt-0 pb-4">
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <h1 className="font-semibold text-2xl">Issues</h1>
          <IssuesTableAggregated issues={issues} />
        </div>
      </div>
    </>
  );
}
