"use client";

import useSWR from "swr";
import { MarkdownContent } from "@/components/markdown-content";
import { formatDateTime } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IssueView } from "@/modules/issues/model";

async function fetchIssue(url: string): Promise<IssueView> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch issue");
  }
  return res.json();
}

interface IssueDetailProps {
  projectId: string;
  issueId: string;
  initialIssue: IssueView;
}

export function IssueDetail({
  projectId,
  issueId,
  initialIssue,
}: IssueDetailProps) {
  const { data } = useSWR<IssueView>(
    `/api/projects/${projectId}/issues/${issueId}`,
    fetchIssue,
    {
      fallbackData: initialIssue,
      refreshInterval: 5_000,
    }
  );
  const issue = data ?? initialIssue;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-2xl">
            <span className="text-muted-foreground">#{issue.id}</span>{" "}
            {issue.title}
          </CardTitle>
          <Badge variant="secondary">{issue.status}</Badge>
        </div>
        <div className="text-muted-foreground text-sm">
          Created: {formatDateTime(issue.createdAt)} | Updated:{" "}
          {formatDateTime(issue.updatedAt)}
        </div>
      </CardHeader>
      <CardContent>
        {issue.description ? (
          <MarkdownContent content={issue.description} />
        ) : (
          <p className="text-muted-foreground">No description.</p>
        )}
      </CardContent>
    </Card>
  );
}
