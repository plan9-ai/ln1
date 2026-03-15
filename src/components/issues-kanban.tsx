"use client";

import { IconGripVertical } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { type BoardData, type BoardItem, Kanban } from "react-kanban-kit";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Badge } from "@/components/ui/badge";
import type { IssueView } from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const EMPTY_ISSUES: IssueView[] = [];
const EMPTY_STATUSES: ProjectStatusView[] = [];

const STATUS_PREFIX = "status-";
const ISSUE_PREFIX = "issue-";

function parseStatusId(id: string): number {
  return Number.parseInt(id.slice(STATUS_PREFIX.length), 10);
}

function parseIssueId(id: string): number {
  return Number.parseInt(id.slice(ISSUE_PREFIX.length), 10);
}

interface IssuesKanbanProps {
  fallbackData?: IssueView[];
  projectId: string;
  slug: string;
  statuses: ProjectStatusView[];
}

async function fetchIssues(url: string): Promise<IssueView[]> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch issues");
  }
  return res.json();
}

interface ReorderIssuesArg {
  statusId: number;
  issueIds: number[];
}

interface MoveIssueArg {
  issueId: number;
  targetStatusId: number;
  targetIndex: number;
}

async function reorderIssuesFetcher(
  url: string,
  { arg }: { arg: ReorderIssuesArg }
) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    throw new Error("Failed to reorder");
  }
}

async function moveIssueFetcher(
  url: string,
  { arg }: { arg: MoveIssueArg }
) {
  const res = await fetch(`${url}/${arg.issueId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetStatusId: arg.targetStatusId,
      targetIndex: arg.targetIndex,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to move");
  }
}

export function IssuesKanban({
  fallbackData,
  projectId,
  slug,
  statuses,
}: IssuesKanbanProps) {
  const router = useRouter();
  const url = `/api/projects/${projectId}/issues`;
  const { data, isLoading } = useSWR<IssueView[]>(url, fetchIssues, {
    fallbackData,
    refreshInterval: 30_000,
  });
  const issues = data ?? EMPTY_ISSUES;
  const statusList = statuses ?? EMPTY_STATUSES;

  const issuesByStatus = useMemo(() => {
    const map = new Map<number, IssueView[]>();
    for (const status of statusList) {
      map.set(status.id, []);
    }
    for (const issue of issues) {
      const list = map.get(issue.statusId);
      if (list) {
        list.push(issue);
      } else {
        map.set(issue.statusId, [issue]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.priority - b.priority);
    }
    return map;
  }, [issues, statusList]);

  const dataSource: BoardData = useMemo(() => {
    const root: BoardItem = {
      id: "root",
      title: "Root",
      children: statusList.map((s) => `${STATUS_PREFIX}${s.id}`),
      totalChildrenCount: statusList.length,
      parentId: null,
    };

    const columnEntries = statusList.map((status) => {
      const columnIssues = issuesByStatus.get(status.id) ?? [];
      const childIds = columnIssues.map((i) => `${ISSUE_PREFIX}${i.id}`);
      return [
        `${STATUS_PREFIX}${status.id}`,
        {
          id: `${STATUS_PREFIX}${status.id}`,
          title: status.name,
          children: childIds,
          totalChildrenCount: childIds.length,
          parentId: "root",
        } as BoardItem,
      ];
    });

    const cardEntries = issues.map((issue) => [
      `${ISSUE_PREFIX}${issue.id}`,
      {
        id: `${ISSUE_PREFIX}${issue.id}`,
        title: issue.title,
        parentId: `${STATUS_PREFIX}${issue.statusId}`,
        children: [],
        totalChildrenCount: 0,
        type: "card" as const,
        content: { issue },
      } as BoardItem,
    ]);

    return {
      root,
      ...Object.fromEntries(columnEntries),
      ...Object.fromEntries(cardEntries),
    };
  }, [issues, statusList, issuesByStatus]);

  const { trigger: triggerReorder } = useSWRMutation(
    url,
    reorderIssuesFetcher
  );
  const { trigger: triggerMove } = useSWRMutation(url, moveIssueFetcher);

  const onCardMove = useCallback(
    (move: {
      cardId: string;
      fromColumnId: string;
      toColumnId: string;
      taskAbove: string | null;
      taskBelow: string | null;
      position: number;
    }) => {
      const issueId = parseIssueId(move.cardId);
      const sourceStatusId = parseStatusId(move.fromColumnId);
      const targetStatusId = parseStatusId(move.toColumnId);
      const { position } = move;

      if (sourceStatusId === targetStatusId) {
        const sourceIssues = issuesByStatus.get(sourceStatusId) ?? [];
        const oldIndex = sourceIssues.findIndex((i) => i.id === issueId);
        if (oldIndex < 0 || oldIndex === position) {
          return;
        }
        const reordered = [...sourceIssues];
        const [removed] = reordered.splice(oldIndex, 1);
        reordered.splice(position, 0, removed);
        const issueIds = reordered.map((i) => i.id);
        const optimistic = issues.map((i) => {
          if (i.statusId !== sourceStatusId) {
            return i;
          }
          const newIdx = reordered.findIndex((r) => r.id === i.id);
          return newIdx < 0 ? i : { ...i, priority: newIdx };
        });
        triggerReorder(
          { statusId: sourceStatusId, issueIds },
          { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
        ).catch(() => undefined);
        return;
      }

      const movedIssue = issues.find((i) => i.id === issueId);
      if (!movedIssue) {
        return;
      }

      const sourceIssues = issuesByStatus.get(sourceStatusId) ?? [];
      const targetIssues = issuesByStatus.get(targetStatusId) ?? [];
      const newTargetIssues = [...targetIssues];
      newTargetIssues.splice(position, 0, movedIssue);
      const newSourceIssues = sourceIssues.filter((i) => i.id !== issueId);

      const optimistic = issues.map((i) => {
        if (i.id === issueId) {
          return { ...i, statusId: targetStatusId, priority: position };
        }
        if (i.statusId === sourceStatusId) {
          const newIdx = newSourceIssues.findIndex((s) => s.id === i.id);
          return newIdx >= 0 ? { ...i, priority: newIdx } : i;
        }
        if (i.statusId === targetStatusId) {
          const newIdx = newTargetIssues.findIndex((t) => t.id === i.id);
          return newIdx >= 0 ? { ...i, priority: newIdx } : i;
        }
        return i;
      });

      triggerMove(
        { issueId, targetStatusId, targetIndex: position },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: false }
      ).catch(() => undefined);
    },
    [issues, issuesByStatus, triggerReorder, triggerMove]
  );

  const onCardClick = useCallback(
    (_e: React.MouseEvent, card: BoardItem) => {
      const issue = (card.content as { issue?: IssueView })?.issue;
      if (issue) {
        router.push(`/${slug}/projects/${projectId}/issues/${issue.id}`);
      }
    },
    [slug, projectId, router]
  );

  const configMap = useMemo(
    () => ({
      card: {
        render: ({
          data,
        }: {
          data: BoardItem;
          column: BoardItem;
          index: number;
          isDraggable: boolean;
        }) => {
          const issue = (data.content as { issue?: IssueView })?.issue;
          if (!issue) {
            return null;
          }
          return (
            <div className="flex cursor-pointer items-start gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-muted/50">
              <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                <IconGripVertical className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium">{data.title}</span>
                <div className="mt-1 text-muted-foreground text-xs">
                  {formatDate(issue.createdAt)}
                </div>
              </div>
            </div>
          );
        },
        isDraggable: true,
      },
    }),
    []
  );

  return (
    <div className="flex min-h-[400px] w-full flex-col gap-4">
      <Kanban
        cardsGap={8}
        columnWrapperClassName={() =>
          "flex min-w-[280px] flex-col rounded-lg border bg-muted/30 p-3 self-start"
        }
        configMap={configMap}
        dataSource={dataSource}
        onCardClick={onCardClick}
        onCardMove={onCardMove}
        renderCardDragPreview={(card) => {
          const issue = (card.content as { issue?: IssueView })?.issue;
          if (!issue) {
            return null;
          }
          return (
            <div className="flex cursor-grab items-start gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow-xl ring-2 ring-primary/20">
              <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
                <IconGripVertical className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium">{card.title}</span>
                <div className="mt-1 text-muted-foreground text-xs">
                  {formatDate(issue.createdAt)}
                </div>
              </div>
            </div>
          );
        }}
        renderColumnHeader={(column) => {
          const statusId = parseStatusId(column.id);
          const status = statusList.find((s) => s.id === statusId);
          const count = column.totalChildrenCount ?? 0;
          return (
            <div className="mb-2 flex items-center gap-2">
              <Badge className="text-muted-foreground" variant="outline">
                {status?.name ?? column.title}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {count} issue(s)
              </span>
            </div>
          );
        }}
        rootClassName="flex gap-4 overflow-x-auto pb-4"
        virtualization={false}
      />
      {isLoading && issues.length === 0 && (
        <p className="text-center text-muted-foreground">Loading issues...</p>
      )}
      {!isLoading && issues.length === 0 && (
        <p className="text-center text-muted-foreground">No issues found.</p>
      )}
    </div>
  );
}
