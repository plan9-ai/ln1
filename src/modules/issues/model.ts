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

export interface IssueListItem {
  id: number;
  title: string;
  status: string;
  statusSlug: string;
  projectId: number;
  projectTitle: string;
  teamSlug: string;
  assigneeUserId: string | null;
  updatedAt: number;
}

export interface IssueCommentView {
  id: number;
  userId: string;
  body: string;
  createdAt: number;
}

export interface IssueFullView extends IssueWithContext {
  project: {
    id: number;
    title: string;
    description: string;
    agents: string;
    repository: string | null;
  };
  comments: IssueCommentView[];
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
