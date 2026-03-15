"use client";

import useSWR, { useSWRConfig } from "swr";
import { InsertCommentForm } from "@/components/insert-comment-form";
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
  const { mutate } = useSWRConfig();
  const swrKey = COMMENTS_SWR_KEY(projectId, issueId);
  const { data, isLoading } = useSWR<IssueCommentsSelect[]>(
    swrKey,
    fetchComments,
    {
      fallbackData: initialComments,
      revalidateOnFocus: false,
      refreshInterval: 30_000,
    }
  );
  const comments = data ?? [];

  const handleCommentInserted = () => {
    mutate(swrKey);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <div className="mb-1 text-muted-foreground text-sm">
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
                {new Date(comment.createdAt * 1000).toLocaleString()}
              </div>
              <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
            </div>
          ))}
        <InsertCommentForm
          issueId={issueId}
          onSuccess={handleCommentInserted}
          projectId={projectId}
          slug={slug}
        />
      </CardContent>
    </Card>
  );
}
