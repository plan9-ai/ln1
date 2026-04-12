"use client";

import { Paperclip } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadedFileView {
  id: number;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

async function fetchAttachments(url: string): Promise<UploadedFileView[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface IssueAttachmentsProps {
  issueId: string;
}

export function IssueAttachments({ issueId }: IssueAttachmentsProps) {
  const { data: attachments = [] } = useSWR(
    `/api/uploaded-files?key=issues-${issueId}`,
    fetchAttachments,
    { refreshInterval: 10_000 }
  );

  if (attachments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="size-4" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {attachments.map((f) => (
            <li
              className="flex items-center justify-between rounded-md border px-3 py-2"
              key={f.id}
            >
              <a
                className="text-primary text-sm hover:underline"
                href={`/api/uploaded-files/${f.id}/download`}
                rel="noopener"
                target="_blank"
              >
                {f.filename}
              </a>
              <span className="text-muted-foreground text-xs">
                {formatSize(f.size)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
