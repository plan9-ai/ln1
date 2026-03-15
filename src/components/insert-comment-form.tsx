"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { insertComment } from "@/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  type InsertCommentBody,
  insertCommentBodySchema,
} from "@/db/schema/issue-comments";

interface InsertCommentFormProps {
  slug: string;
  projectId: string;
  issueId: string;
  onSuccess?: () => void;
}

export function InsertCommentForm({
  slug,
  projectId,
  issueId,
  onSuccess,
}: InsertCommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InsertCommentBody>({
    resolver: typeboxResolver(insertCommentBodySchema),
    defaultValues: {
      body: "",
    },
  });

  const onSubmit = async (data: InsertCommentBody) => {
    try {
      await insertComment(slug, projectId, issueId, { body: data.body });
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to insert comment"
      );
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!errors.body}>
          <FieldLabel htmlFor="body">Comment</FieldLabel>
          <Textarea
            aria-invalid={!!errors.body}
            id="body"
            placeholder="Write a comment..."
            rows={3}
            {...register("body")}
          />
          {errors.body && (
            <span className="text-destructive text-sm">
              {errors.body.message}
            </span>
          )}
        </Field>
      </FieldGroup>
      <Button disabled={isSubmitting} size="sm" type="submit">
        Add comment
      </Button>
    </form>
  );
}
