"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconDotsVertical, IconGripVertical } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IssueView } from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";

const EMPTY_ISSUES: IssueView[] = [];

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface IssuesTablesByStatusProps {
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

function DraggableRow({
  row,
  onRowClick,
}: {
  row: Row<IssueView>;
  onRowClick: () => void;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      className="relative z-0 cursor-pointer hover:bg-muted/50 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging}
      onClick={onRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onRowClick();
        }
      }}
      ref={setNodeRef}
      role="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      tabIndex={0}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          className={(() => {
            if (cell.column.id === "actions") {
              return "w-10 text-right";
            }
            if (cell.column.id === "createdAt") {
              return "whitespace-nowrap";
            }
            return undefined;
          })()}
          key={cell.id}
          onClick={
            cell.column.id === "drag" || cell.column.id === "actions"
              ? (e) => e.stopPropagation()
              : undefined
          }
        >
          {cell.column.id === "drag" ? (
            <Button
              {...attributes}
              {...listeners}
              className="size-7 text-muted-foreground hover:bg-transparent"
              onClick={(e) => e.stopPropagation()}
              size="icon"
              variant="ghost"
            >
              <IconGripVertical className="size-3 text-muted-foreground" />
              <span className="sr-only">Drag to reorder</span>
            </Button>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

function getColumns(slug: string, projectId: string): ColumnDef<IssueView>[] {
  return [
    {
      id: "drag",
      header: () => null,
      cell: () => null,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              onClick={(e) => e.stopPropagation()}
              size="icon"
              variant="ghost"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/${slug}/projects/${projectId}/issues/edit/${row.original.id}`}
              >
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

function StatusTable({
  status,
  issues,
  slug,
  projectId,
  url,
  mutate,
  allIssues,
}: {
  status: ProjectStatusView;
  issues: IssueView[];
  slug: string;
  projectId: string;
  url: string;
  mutate: (data?: IssueView[], shouldRevalidate?: boolean) => void;
  allIssues: IssueView[];
}) {
  const router = useRouter();
  const sortableId = useId();
  const [orderedIssues, setOrderedIssues] = useState<IssueView[]>(() => issues);

  useEffect(() => {
    setOrderedIssues(issues);
  }, [issues]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => orderedIssues.map((i) => i.id),
    [orderedIssues]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active?.id) {
      return;
    }
    if (!over?.id) {
      return;
    }
    if (active.id === over.id) {
      return;
    }
    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);
    const newOrder = arrayMove(orderedIssues, oldIndex, newIndex);
    setOrderedIssues(newOrder);
    const issueIds = newOrder.map((i) => i.id);

    const optimistic = allIssues.map((i) => {
      if (i.statusId !== status.id) {
        return i;
      }
      const idx = newOrder.findIndex((r) => r.id === i.id);
      return idx < 0 ? i : { ...i, priority: idx };
    });
    mutate(optimistic, false);

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: status.id, issueIds }),
      });
      if (!res.ok) {
        throw new Error("Failed to update order");
      }
      await mutate();
    } catch {
      mutate(allIssues, false);
    }
  }

  const tableColumns = useMemo(
    () => getColumns(slug, projectId),
    [slug, projectId]
  );
  const table = useReactTable({
    data: orderedIssues,
    columns: tableColumns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Badge className="text-muted-foreground" variant="outline">
          {status.name}
        </Badge>
        <span className="text-muted-foreground text-sm">
          {issues.length} issue(s)
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          id={sortableId}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table className="table-fixed">
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className={(() => {
                        if (header.column.id === "actions") {
                          return "w-10 min-w-10 shrink-0 text-right";
                        }
                        if (header.column.id === "createdAt") {
                          return "w-24 shrink-0 whitespace-nowrap";
                        }
                        if (header.column.id === "drag") {
                          return "w-8 shrink-0";
                        }
                        return "min-w-0";
                      })()}
                      colSpan={header.colSpan}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell className="w-8 shrink-0" />
                  <TableCell className="h-16 min-w-0 text-muted-foreground">
                    No issues
                  </TableCell>
                  <TableCell className="w-24 shrink-0 whitespace-nowrap" />
                  <TableCell className="w-10 min-w-10 shrink-0 text-right" />
                </TableRow>
              ) : (
                <SortableContext
                  items={table.getRowModel().rows.map((row) => row.original.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      onRowClick={() =>
                        router.push(
                          `/${slug}/projects/${projectId}/issues/${row.original.id}`
                        )
                      }
                      row={row}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}

export function IssuesTablesByStatus({
  fallbackData,
  projectId,
  slug,
  statuses,
}: IssuesTablesByStatusProps) {
  const url = `/api/projects/${projectId}/issues`;
  const { data, isLoading, mutate } = useSWR<IssueView[]>(url, fetchIssues, {
    fallbackData,
    refreshInterval: 30_000,
  });
  const issues = data ?? EMPTY_ISSUES;
  const statusList = statuses ?? [];

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

  if (isLoading && issues.length === 0) {
    return (
      <p className="text-center text-muted-foreground">Loading issues...</p>
    );
  }

  if (!isLoading && issues.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No issues found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {statusList.map((status) => {
        const issuesInStatus = issuesByStatus.get(status.id) ?? [];
        return (
          <StatusTable
            allIssues={issues}
            issues={issuesInStatus}
            key={status.id}
            mutate={mutate}
            projectId={projectId}
            slug={slug}
            status={status}
            url={url}
          />
        );
      })}
    </div>
  );
}
