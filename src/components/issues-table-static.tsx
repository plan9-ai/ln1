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
import type { IssueView } from "@/modules/issues/model";

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface IssuesTableStaticProps {
  issues: IssueView[];
  projectId: string;
  slug: string;
}

export function IssuesTableStatic({
  issues,
  projectId,
  slug,
}: IssuesTableStaticProps) {
  return (
    <div className="flex w-full flex-col gap-4 px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {issues.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No issues found.
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <span aria-hidden className="size-7" />
                  </TableCell>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/${slug}/projects/${projectId}/issues/${issue.id}`}
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
                    {formatDate(issue.createdAt)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
