"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTeam } from "@/app/(restricted)/[slug]/teams/new/actions";
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
  createTeamFormSchema,
  type InferCreateTeamFormSchema,
} from "@/modules/teams/model";

export function CreateTeamForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InferCreateTeamFormSchema>({
    resolver: typeboxResolver(createTeamFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
    },
  });

  const onSubmit = async (data: InferCreateTeamFormSchema) => {
    try {
      await createTeam({
        title: data.title,
        slug: data.slug,
        description: data.description ?? "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Team details</CardTitle>
          <CardDescription>
            Set a title, slug and description for your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                aria-invalid={!!errors.title}
                id="title"
                placeholder="e.g. Engineering"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-destructive text-sm">
                  {errors.title.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                aria-invalid={!!errors.slug}
                id="slug"
                placeholder="e.g. engineering"
                {...register("slug")}
              />
              {errors.slug && (
                <span className="text-destructive text-sm">
                  {errors.slug.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                aria-invalid={!!errors.description}
                id="description"
                placeholder="Brief description of the team..."
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
          Create Team
        </Button>
      </div>
    </form>
  );
}
