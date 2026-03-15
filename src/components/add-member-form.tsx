"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addTeamMember } from "@/app/(restricted)/[slug]/members/actions";
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
import {
  addMemberFormSchema,
  type InferAddMemberFormSchema,
} from "@/modules/teams/model";

interface AddMemberFormProps {
  slug: string;
}

export function AddMemberForm({ slug }: AddMemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<InferAddMemberFormSchema>({
    resolver: typeboxResolver(addMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: InferAddMemberFormSchema) => {
    try {
      await addTeamMember(slug, data.email, data.role);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
          <CardDescription>
            Add a member to the team by email. The user must have an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="member-email">Email</FieldLabel>
              <Input
                aria-invalid={!!errors.email}
                id="member-email"
                placeholder="user@example.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-destructive text-sm">
                  {errors.email.message}
                </span>
              )}
            </Field>
            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor="member-role">Role</FieldLabel>
              <Select
                value={roleValue}
                onValueChange={(v) =>
                  setValue("role", v as InferAddMemberFormSchema["role"])
                }
              >
                <SelectTrigger id="member-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="member">member</SelectItem>
                  <SelectItem value="viewer">viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <span className="text-destructive text-sm">
                  {errors.role.message}
                </span>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={isSubmitting} size="lg" type="submit">
          Add member
        </Button>
      </div>
    </form>
  );
}
