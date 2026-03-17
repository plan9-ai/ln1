import { Elysia } from "elysia";
import { authEnsureSession } from "@/lib/ensure-user-in-app-db";
import { getSessionForRequest } from "@/lib/auth";
import { CommentsService } from "@/modules/comments/service";
import { IssuesService } from "@/modules/issues/service";
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import {
  issueCommentsParamsSchema,
  issueIdParamsSchema,
  moveIssueBodySchema,
  projectIdParamsSchema,
  reorderIssuesBodySchema,
} from "./model";

export const projectsRoutes = new Elysia({ prefix: "/projects" })
  .get(
    "/:id/statuses",
    async ({ params: { id }, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const statuses = await ProjectStatusesService.getStatusesByProjectId(
        session.user.id,
        id
      );
      return statuses;
    },
    {
      params: projectIdParamsSchema,
    }
  )
  .patch(
    "/:id/issues",
    async ({ params: { id }, body, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      await IssuesService.updateIssuesPrioritiesInStatus(
        session.user.id,
        id,
        body.statusId,
        body.issueIds
      );
      return { ok: true };
    },
    {
      params: projectIdParamsSchema,
      body: reorderIssuesBodySchema,
    }
  )
  .patch(
    "/:id/issues/:issueId/move",
    async ({ params: { id, issueId }, body, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      await IssuesService.moveIssueToStatus(
        session.user.id,
        id,
        issueId,
        body.targetStatusId,
        body.targetIndex
      );
      return { ok: true };
    },
    {
      params: issueIdParamsSchema,
      body: moveIssueBodySchema,
    }
  )
  .get(
    "/:id/issues",
    async ({ params: { id }, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const issues = await IssuesService.getIssuesByProjectId(
        session.user.id,
        id
      );
      return issues;
    },
    {
      params: projectIdParamsSchema,
    }
  )
  .get(
    "/:id/issues/:issueId/comments",
    async ({ params: { issueId }, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const comments = await CommentsService.getCommentsByIssueId(
        session.user.id,
        issueId
      );
      return comments;
    },
    {
      params: issueCommentsParamsSchema,
    }
  );
