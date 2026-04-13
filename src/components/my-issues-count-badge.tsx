"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";

async function fetchCount(url: string): Promise<{ count: number }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch active issues count");
  }
  return res.json();
}

interface MyIssuesCountBadgeProps {
  initialCount: number;
}

export function MyIssuesCountBadge({ initialCount }: MyIssuesCountBadgeProps) {
  const { data } = useSWR<{ count: number }>(
    "/api/me/active-issues-count",
    fetchCount,
    {
      fallbackData: { count: initialCount },
      refreshInterval: 30_000,
    }
  );
  const count = data?.count ?? initialCount;
  if (count <= 0) {
    return null;
  }
  return (
    <Badge className="ml-auto tabular-nums" variant="destructive">
      {count}
    </Badge>
  );
}
