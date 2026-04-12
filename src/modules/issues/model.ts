import { type Static, Type } from "@sinclair/typebox";

export interface CreateIssueBody {
  title: string;
  description?: string;
  statusId: number;
  assigneeUserId?: string | null;
}

export interface UpdateIssueBody {
  title: string;
  description?: string;
  statusId: number;
  assigneeUserId: string | null;
}

export interface IssueView {
  id: number;
  projectId: number;
  title: string;
  description: string;
  statusId: number;
  status: string;
  statusSlug: string;
  priority: number;
  assigneeUserId: string | null;
  createdAt: number;
  updatedAt: number;
  teamSlug?: string;
}

export interface IssueWithContext extends IssueView {
  teamSlug: string;
  projectTitle: string;
}

export const createIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  statusId: Type.Number(),
  assigneeUserId: Type.Union([Type.String(), Type.Null()]),
});

export type InferCreateIssueFormSchema = Static<typeof createIssueFormSchema>;

export const updateIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  statusId: Type.Number(),
  assigneeUserId: Type.Union([Type.String(), Type.Null()]),
});

export type InferUpdateIssueFormSchema = Static<typeof updateIssueFormSchema>;
