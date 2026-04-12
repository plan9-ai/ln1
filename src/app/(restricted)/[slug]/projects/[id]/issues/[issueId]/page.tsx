import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentsList } from "@/components/comments-list";
import { IssueAttachments } from "@/components/issue-attachments";
import { IssueDetail } from "@/components/issue-detail";
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
import { CommentsService } from "@/modules/comments/service";
import { IssuesService } from "@/modules/issues/service";
import { ProjectsService } from "@/modules/projects/service";

export default async function ViewIssuePage({
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
                <BreadcrumbPage>{issue.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="flex w-full max-w-2xl flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button asChild size="sm" variant="ghost">
              <Link href={`/${slug}/projects/${id}/issues`}>
                &larr; Back to project
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/${slug}/projects/${id}/issues/edit/${issueId}`}>
                Edit
              </Link>
            </Button>
          </div>

          <IssueDetail
            initialIssue={issue}
            issueId={issueId}
            projectId={id}
          />

          <IssueAttachments issueId={issueId} />

          <CommentsList
            currentUserId={session.user.id}
            initialComments={comments}
            issueId={issueId}
            projectId={id}
            slug={slug}
          />
        </div>
      </div>
    </>
  );
}
