"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { createIssue } from "@/app/(restricted)/[slug]/projects/[id]/issues/new/actions";
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
  createIssueFormSchema,
  type InferCreateIssueFormSchema,
} from "@/modules/issues/model";
import type { ProjectStatusView } from "@/modules/project-statuses/service";

interface CreateIssueFormProps {
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

export function CreateIssueForm({
  projectId,
  projectStatuses,
  slug,
}: CreateIssueFormProps) {
  const { data: statuses } = useSWR(
    `/api/projects/${projectId}/statuses`,
    fetchStatuses,
    { fallbackData: projectStatuses }
  );

  const defaultStatusId = statuses?.[0]?.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InferCreateIssueFormSchema>({
    resolver: typeboxResolver(createIssueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      statusId: defaultStatusId ?? 0,
    },
  });

  const onSubmit = async (data: InferCreateIssueFormSchema) => {
    try {
      await createIssue(slug, projectId, {
        title: data.title,
        description: data.description ?? "",
        statusId: data.statusId,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create issue"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Issue details</CardTitle>
          <CardDescription>
            Set a title, description and status for the issue.
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

      <div className="flex justify-end">
        <Button disabled={isSubmitting} size="lg" type="submit">
          Create Issue
        </Button>
      </div>
    </form>
  );
}
