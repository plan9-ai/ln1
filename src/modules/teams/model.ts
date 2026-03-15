import { type Static, Type } from "@sinclair/typebox";
import { emailPatternSource } from "@/lib/email-validation";

export interface CreateTeamBody {
  title: string;
  slug: string;
  description?: string;
}

export interface TeamWithRole {
  id: number;
  title: string;
  slug: string;
  description: string;
  role: "owner" | "admin" | "member" | "viewer";
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createTeamFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  slug: Type.String({ pattern: slugPattern.source }),
  description: Type.Optional(Type.String()),
});

export type InferCreateTeamFormSchema = Static<typeof createTeamFormSchema>;

export const addMemberFormSchema = Type.Object({
  email: Type.String({ pattern: emailPatternSource }),
  role: Type.Union([
    Type.Literal("admin"),
    Type.Literal("member"),
    Type.Literal("viewer"),
  ]),
});

export type InferAddMemberFormSchema = Static<typeof addMemberFormSchema>;
