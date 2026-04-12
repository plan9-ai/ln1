"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { insertComment } from "@/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/actions";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
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
  const [editorKey, setEditorKey] = useState(0);
  const {
    handleSubmit,
    control,
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
      setEditorKey((k) => k + 1);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to insert comment"
      );
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Field data-invalid={!!errors.body}>
        <FieldLabel htmlFor="body">Comment</FieldLabel>
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <MarkdownEditor
              key={editorKey}
              onChange={field.onChange}
              placeholder="Write a comment..."
              uploadKey={`issues-${issueId}`}
              value={field.value ?? ""}
            />
          )}
        />
        {errors.body && (
          <span className="text-destructive text-sm">
            {errors.body.message}
          </span>
        )}
      </Field>
      <Button disabled={isSubmitting} size="sm" type="submit">
        Add comment
      </Button>
    </form>
  );
}
