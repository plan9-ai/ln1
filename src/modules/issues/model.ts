import { type Static, Type } from "@sinclair/typebox";

export interface CreateIssueBody {
  title: string;
  description?: string;
  statusId: number;
}

export interface UpdateIssueBody {
  title: string;
  description?: string;
  statusId: number;
}

export interface IssueView {
  id: number;
  projectId: number;
  title: string;
  description: string;
  statusId: number;
  status: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface IssueWithContext extends IssueView {
  teamSlug: string;
  projectTitle: string;
}

export const createIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  statusId: Type.Number(),
});

export type InferCreateIssueFormSchema = Static<typeof createIssueFormSchema>;

export const updateIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  statusId: Type.Number(),
});

export type InferUpdateIssueFormSchema = Static<typeof updateIssueFormSchema>;
