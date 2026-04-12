"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { updateIssue } from "@/app/(restricted)/[slug]/projects/[id]/issues/edit/[issueId]/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  type InferUpdateIssueFormSchema,
  type IssueView,
  updateIssueFormSchema,
} from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";
import type { TeamMemberWithEmail } from "@/modules/teams/service";

const ASSIGNEE_NONE_VALUE = "__none__";

interface UploadedFileView {
  id: number;
  key: string;
  s3Path: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

interface EditIssueFormProps {
  issue: IssueView;
  projectId: string;
  projectStatuses: ProjectStatusView[];
  slug: string;
  teamMembers: TeamMemberWithEmail[];
}

async function fetchStatuses(url: string): Promise<ProjectStatusView[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch statuses");
  }
  return res.json();
}

async function fetchAttachments(url: string): Promise<UploadedFileView[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch attachments");
  }
  return res.json();
}

export function EditIssueForm({
  issue,
  projectId,
  projectStatuses,
  slug,
  teamMembers,
}: EditIssueFormProps) {
  const attachmentsKey = `issues-${issue.id}`;
  const { data: attachments = [], mutate: mutateAttachments } = useSWR(
    `/api/uploaded-files?key=${attachmentsKey}`,
    fetchAttachments
  );

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    (file: File): Promise<void> =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("key", attachmentsKey);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            mutateAttachments().catch(() => {
              /* ignore */
            });
            resolve();
          } else {
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setUploadProgress(null);
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/uploaded-files");
        xhr.withCredentials = true;
        xhr.send(formData);
      }),
    [attachmentsKey, mutateAttachments]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) {
        return;
      }
      try {
        for (const file of Array.from(files)) {
          await uploadFile(file);
        }
        toast.success("Files uploaded");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to upload files"
        );
      } finally {
        e.target.value = "";
      }
    },
    [uploadFile]
  );

  const handleDeleteFile = useCallback(
    async (id: number) => {
      try {
        const res = await fetch(`/api/uploaded-files/${id}`, {
          credentials: "include",
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete");
        }
        await mutateAttachments();
        toast.success("File deleted");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete file"
        );
      }
    },
    [mutateAttachments]
  );

  const { data: statuses } = useSWR(
    `/api/projects/${projectId}/statuses`,
    fetchStatuses,
    { fallbackData: projectStatuses }
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InferUpdateIssueFormSchema>({
    resolver: typeboxResolver(updateIssueFormSchema),
    defaultValues: {
      title: issue.title,
      description: issue.description ?? "",
      statusId: issue.statusId,
      assigneeUserId: issue.assigneeUserId ?? null,
    },
  });

  const onSubmit = async (data: InferUpdateIssueFormSchema) => {
    try {
      await updateIssue(slug, projectId, String(issue.id), {
        title: data.title,
        description: data.description ?? "",
        statusId: data.statusId,
        assigneeUserId: data.assigneeUserId,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update issue"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/${slug}/projects/${projectId}/issues/${issue.id}`}>
            &larr; Back
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
          <CardDescription>
            Update the title, description and status for the issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                aria-invalid={!!errors.title}
                id="title"
                placeholder="e.g. Fix login button styling"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-destructive text-sm">
                  {errors.title.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <MarkdownEditor
                    onChange={field.onChange}
                    placeholder="Brief description of the issue..."
                    uploadKey={attachmentsKey}
                    value={field.value ?? ""}
                  />
                )}
              />
              {errors.description && (
                <span className="text-destructive text-sm">
                  {errors.description.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.statusId}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                control={control}
                name="statusId"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={
                      field.value != null ? String(field.value) : undefined
                    }
                  >
                    <SelectTrigger
                      aria-invalid={!!errors.statusId}
                      className="w-full"
                      id="status"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.statusId && (
                <span className="text-destructive text-sm">
                  {errors.statusId.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.assigneeUserId}>
              <FieldLabel htmlFor="assignee">Assignee</FieldLabel>
              <Controller
                control={control}
                name="assigneeUserId"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) =>
                      field.onChange(v === ASSIGNEE_NONE_VALUE ? null : v)
                    }
                    value={
                      field.value != null ? field.value : ASSIGNEE_NONE_VALUE
                    }
                  >
                    <SelectTrigger
                      aria-invalid={!!errors.assigneeUserId}
                      className="w-full"
                      id="assignee"
                    >
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ASSIGNEE_NONE_VALUE}>
                        Unassigned
                      </SelectItem>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>
                          {m.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeUserId && (
                <span className="text-destructive text-sm">
                  {errors.assigneeUserId.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>
            Attach files to this issue. Click to download, or remove to delete.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <input
              accept="*"
              className="cursor-pointer text-sm file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground file:text-sm file:hover:bg-primary/90"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            {uploadProgress != null && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
          {attachments.length > 0 && (
            <ul className="flex flex-col gap-2">
              {attachments.map((f) => (
                <li
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                  key={f.id}
                >
                  <a
                    className="text-primary hover:underline"
                    href={`/api/uploaded-files/${f.id}/download`}
                    rel="noopener"
                    target="_blank"
                  >
                    {f.filename}
                  </a>
                  <Button
                    onClick={() => handleDeleteFile(f.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="ghost">
          <Link href={`/${slug}/projects/${projectId}/issues/${issue.id}`}>
            Cancel
          </Link>
        </Button>
        <Button disabled={isSubmitting} size="lg" type="submit">
          Save
        </Button>
      </div>
    </form>
  );
}
