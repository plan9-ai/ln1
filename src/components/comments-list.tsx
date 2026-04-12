"use client";

import useSWR from "swr";
import { InsertCommentForm } from "@/components/insert-comment-form";
import { MarkdownContent } from "@/components/markdown-content";
import { formatDateTime } from "@/lib/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IssueCommentsSelect } from "@/db/schema/issue-comments";

const COMMENTS_SWR_KEY = (projectId: string, issueId: string) =>
  `/api/projects/${projectId}/issues/${issueId}/comments`;

async function fetchComments(url: string): Promise<IssueCommentsSelect[]> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch comments");
  }
  return res.json();
}

interface CommentsListProps {
  projectId: string;
  issueId: string;
  slug: string;
  currentUserId: string;
  initialComments?: IssueCommentsSelect[];
}

export function CommentsList({
  projectId,
  issueId,
  slug,
  currentUserId,
  initialComments,
}: CommentsListProps) {
  const { data, isLoading, mutate } = useSWR<IssueCommentsSelect[]>(
    COMMENTS_SWR_KEY(projectId, issueId),
    fetchComments,
    {
      fallbackData: initialComments,
      refreshInterval: 5_000,
    }
  );
  const comments = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <div className="text-muted-foreground text-sm">
            Loading comments...
          </div>
        )}
        {!isLoading &&
          comments.map((comment) => (
            <div
              className="border-muted border-b pb-3 last:border-0 last:pb-0"
              key={comment.id}
            >
              <div className="mb-1 text-muted-foreground text-sm">
                {comment.userId === currentUserId ? "You" : "User"} ·{" "}
                {formatDateTime(comment.createdAt)}
              </div>
              <MarkdownContent content={comment.body} />
            </div>
          ))}
        <InsertCommentForm
          issueId={issueId}
          onSuccess={() => mutate()}
          projectId={projectId}
          slug={slug}
        />
      </CardContent>
    </Card>
  );
}
