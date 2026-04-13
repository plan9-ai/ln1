"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import type { IssueWithContext } from "@/modules/issues/model";

function getStatusRowColor(slug: string): string {
  switch (slug) {
    case "done":
      return "bg-green-50 dark:bg-green-950/20";
    case "in-progress":
      return "bg-blue-50 dark:bg-blue-950/20";
    case "in-testing":
      return "bg-amber-50 dark:bg-amber-950/30";
    case "ready-for-release":
      return "bg-orange-50 dark:bg-orange-950/20";
    default:
      return "";
  }
}

interface IssuesTableAggregatedProps {
  issues: IssueWithContext[];
}

export function IssuesTableAggregated({ issues }: IssuesTableAggregatedProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-16 shrink-0">ID</TableHead>
            <TableHead className="min-w-0">Title</TableHead>
            <TableHead className="w-32 shrink-0">Project</TableHead>
            <TableHead className="w-28 shrink-0 whitespace-nowrap">
              Updated
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={4}
              >
                No issues found.
              </TableCell>
            </TableRow>
          ) : (
            issues.map((issue) => {
              const href = `/${issue.teamSlug}/projects/${issue.projectId}/issues/${issue.id}`;
              return (
                <TableRow
                  className={`cursor-pointer hover:bg-muted/50 ${getStatusRowColor(issue.statusSlug)}`}
                  key={`${issue.teamSlug}-${issue.projectId}-${issue.id}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {issue.id}
                  </TableCell>
                  <TableCell className="min-w-0">
                    <span className="block truncate font-medium">
                      {issue.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {issue.projectTitle}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                    {formatDate(issue.updatedAt)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
