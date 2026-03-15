"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProject } from "@/app/(restricted)/[slug]/projects/new/actions";
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
  type ProjectsInsert,
  projectsInsertSchema,
} from "@/db/schema/projects";

interface CreateProjectFormProps {
  teamSlug: string;
}

export function CreateProjectForm({ teamSlug }: CreateProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectsInsert>({
    resolver: typeboxResolver(projectsInsertSchema),
    defaultValues: {
      teamId: 0,
      title: "",
      description: "",
      createdAt: 0,
      updatedAt: 0,
    },
  });

  const onSubmit = async (data: ProjectsInsert) => {
    try {
      await createProject(teamSlug, {
        title: data.title,
        description: data.description ?? "",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create project"
      );
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
          <CardDescription>
            Set a title and description for your project.
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
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                aria-invalid={!!errors.description}
                id="description"
                placeholder="Brief description of the project..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <span className="text-destructive text-sm">
                  {errors.description.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} size="lg" type="submit">
          Create Project
        </Button>
      </div>
    </form>
  );
}
