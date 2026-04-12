"use client";

import Link from "next/link";
import useSWR from "swr";
import { formatDateTime } from "@/lib/format-date";

interface NotificationView {
  id: number;
  userId: string;
  entityKey: string;
  kind: string;
  payload: Record<string, unknown> | null;
  createdAt: number;
  readAt: number | null;
}

interface IssuePayload {
  issueId: number;
  issueTitle: string;
  projectId: number;
  teamSlug: string;
}

interface TeamPayload {
  teamId: number;
  teamSlug: string;
  teamName: string;
}

function notificationLabel(
  kind: string,
  payload: Record<string, unknown> | null
): string {
  switch (kind) {
    case "issue_assigned": {
      const p = payload as IssuePayload | null;
      return p?.issueTitle
        ? `You were assigned: ${p.issueTitle}`
        : "You were assigned an issue";
    }
    case "issue_commented": {
      const p = payload as IssuePayload | null;
      return p?.issueTitle
        ? `New comment on: ${p.issueTitle}`
        : "New comment on an issue";
    }
    case "team_joined": {
      const p = payload as TeamPayload | null;
      return p?.teamName
        ? `You were added to team: ${p.teamName}`
        : "You were added to a team";
    }
    default:
      return kind;
  }
}

function notificationHref(
  kind: string,
  payload: Record<string, unknown> | null
): string | null {
  switch (kind) {
    case "issue_assigned":
    case "issue_commented": {
      const p = payload as IssuePayload | null;
      if (p?.teamSlug && p?.projectId && p?.issueId) {
        return `/${p.teamSlug}/projects/${p.projectId}/issues/${p.issueId}`;
      }
      return null;
    }
    case "team_joined": {
      const p = payload as TeamPayload | null;
      if (p?.teamSlug) {
        return `/${p.teamSlug}`;
      }
      return null;
    }
    default:
      return null;
  }
}

function parsePayload(
  payload: unknown
): Record<string, unknown> | null {
  if (!payload) return null;
  if (typeof payload === "object") return payload as Record<string, unknown>;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchNotifications(url: string): Promise<NotificationView[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

interface NotificationsListProps {
  initialNotifications: NotificationView[];
}

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const { data } = useSWR<NotificationView[]>(
    "/api/notifications",
    fetchNotifications,
    {
      fallbackData: initialNotifications,
      refreshInterval: 5_000,
    }
  );
  const notifications = data ?? [];

  if (notifications.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No notifications yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => {
        const payload = parsePayload(n.payload);
        const href = notificationHref(n.kind, payload);
        const content = (
          <div className="flex items-center gap-3">
            {!n.readAt && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            )}
            <div>
              <p className="font-medium text-sm">
                {notificationLabel(n.kind, payload)}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDateTime(n.createdAt)}
              </p>
            </div>
          </div>
        );
        return href ? (
          <Link
            className="rounded-md border p-3 hover:bg-muted/50"
            href={href}
            key={n.id}
          >
            {content}
          </Link>
        ) : (
          <div className="rounded-md border p-3" key={n.id}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
