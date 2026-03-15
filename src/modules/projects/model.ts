import { Type } from "@sinclair/typebox";

export const projectIdParamsSchema = Type.Object({
  id: Type.Number(),
});

export const reorderIssuesBodySchema = Type.Object({
  statusId: Type.Number(),
  issueIds: Type.Array(Type.Number()),
});

export const moveIssueBodySchema = Type.Object({
  targetStatusId: Type.Number(),
  targetIndex: Type.Number(),
});

export const issueCommentsParamsSchema = Type.Object({
  id: Type.Number(),
  issueId: Type.Number(),
});

export const issueIdParamsSchema = Type.Object({
  id: Type.Number(),
  issueId: Type.Number(),
});

export interface ReorderIssuesBody {
  statusId: number;
  issueIds: number[];
}

export interface MoveIssueBody {
  targetStatusId: number;
  targetIndex: number;
}
