"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import {
  type InferUpdateIssueFormSchema,
  type IssueView,
  updateIssueFormSchema,
} from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";

interface EditIssueFormProps {
  issue: IssueView;
  projectId: string;
  projectStatuses: ProjectStatusView[];
  slug: string;
}

async function fetchStatuses(url: string): Promise<ProjectStatusView[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch statuses");
  }
  return res.json();
}

export function EditIssueForm({
  issue,
  projectId,
  projectStatuses,
  slug,
}: EditIssueFormProps) {
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
    },
  });

  const onSubmit = async (data: InferUpdateIssueFormSchema) => {
    try {
      await updateIssue(slug, projectId, String(issue.id), {
        title: data.title,
        description: data.description ?? "",
        statusId: data.statusId,
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
              <Textarea
                aria-invalid={!!errors.description}
                id="description"
                placeholder="Brief description of the issue..."
                rows={3}
                {...register("description")}
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
          </FieldGroup>
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
