"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProject } from "@/app/(restricted)/[slug]/projects/[id]/edit/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  updateProjectFormSchema,
  type InferUpdateProjectFormSchema,
} from "@/modules/projects/model";

interface EditProjectFormProps {
  teamSlug: string;
  projectId: number;
  defaultValues: {
    title: string;
    description: string;
    agents: string;
    repository: string;
  };
}

export function EditProjectForm({
  teamSlug,
  projectId,
  defaultValues,
}: EditProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InferUpdateProjectFormSchema>({
    resolver: typeboxResolver(updateProjectFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: InferUpdateProjectFormSchema) => {
    try {
      await updateProject(teamSlug, projectId, data);
      toast.success("Project updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update project"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Update the title and description of your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                aria-invalid={!!errors.title}
                id="title"
                placeholder="e.g. Design Engineering"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-destructive text-sm">
                  {errors.title.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">
                Description
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                aria-invalid={!!errors.description}
                className="resize-none"
                id="description"
                placeholder="Brief description of the project..."
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <span className="text-destructive text-sm">
                  {errors.description.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.repository}>
              <FieldLabel htmlFor="repository">
                Repository
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                aria-invalid={!!errors.repository}
                id="repository"
                placeholder="https://github.com/org/repo"
                {...register("repository")}
              />
              {errors.repository && (
                <span className="text-destructive text-sm">
                  {errors.repository.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent instructions</CardTitle>
          <CardDescription>
            Instructions for AI agents working on this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.agents}>
              <Textarea
                aria-invalid={!!errors.agents}
                id="agents"
                placeholder="Enter instructions for agents..."
                rows={10}
                {...register("agents")}
              />
              {errors.agents && (
                <span className="text-destructive text-sm">
                  {errors.agents.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} size="lg" type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
}
