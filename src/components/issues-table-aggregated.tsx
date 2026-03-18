import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IssueWithContext } from "@/modules/issues/model";

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface IssuesTableAggregatedProps {
  issues: IssueWithContext[];
}

export function IssuesTableAggregated({ issues }: IssuesTableAggregatedProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
          {issues.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={6}
              >
                No issues found.
              </TableCell>
            </TableRow>
          ) : (
            issues.map((issue) => (
              <TableRow
                key={`${issue.teamSlug}-${issue.projectId}-${issue.id}`}
              >
                <TableCell>
                  <span aria-hidden className="size-7" />
                </TableCell>
                <TableCell>
                  <Link
                    className="font-medium hover:underline"
                    href={`/${issue.teamSlug}/projects/${issue.projectId}/issues/${issue.id}`}
                  >
                    {issue.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className="text-muted-foreground" variant="outline">
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {issue.projectTitle}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(issue.updatedAt)}
                </TableCell>
                <TableCell />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
