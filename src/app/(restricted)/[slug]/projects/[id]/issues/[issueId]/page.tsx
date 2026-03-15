import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsList } from "@/components/comments-list";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { CommentsService } from "@/modules/comments/service";
import { IssuesService } from "@/modules/issues/service";
import { ProjectsService } from "@/modules/projects/service";

export default async function ViewIssuePage({
  params,
}: {
  params: Promise<{ slug: string; id: string; issueId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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

  const comments = await CommentsService.getCommentsByIssueId(
    session.user.id,
    issueIdNum
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
                <BreadcrumbLink href={`/${slug}/projects/${id}`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{issue.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/${slug}/projects/${id}`}>&larr; Back to project</Link>
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-2xl">{issue.title}</CardTitle>
              <Badge variant="secondary">{issue.status}</Badge>
            </div>
            <div className="text-muted-foreground text-sm">
              Created: {new Date(issue.createdAt * 1000).toLocaleString()} |
              Updated: {new Date(issue.updatedAt * 1000).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {issue.description || "No description."}
            </p>
          </CardContent>
        </Card>

        <CommentsList
          currentUserId={session.user.id}
          initialComments={comments}
          issueId={issueId}
          projectId={id}
          slug={slug}
        />
      </div>
    </>
  );
}
