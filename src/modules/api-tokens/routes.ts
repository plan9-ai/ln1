import { Elysia, t } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { ApiTokensService } from "@/modules/api-tokens/service";
import { CommentsService } from "@/modules/comments/service";
import { IssuesService } from "@/modules/issues/service";
import { ProjectsService } from "@/modules/projects/service";

export const myApiRoutes = new Elysia({ prefix: "/my" })
  .use(openapi({ path: "/openapi" }))
  .derive(async ({ params }) => {
    const { token } = params as { token: string };
    const userId = await ApiTokensService.getUserIdByToken(token);
    if (!userId) {
      throw new Error("Invalid API token");
    }
    return { userId };
  })
  .get(
    "/:token/projects",
    async ({ userId }) => {
      return ProjectsService.getAllProjectsForUser(userId);
    },
    {
      params: t.Object({ token: t.String() }),
      detail: {
        summary: "Get my projects",
        description:
          "Returns all projects from all teams the token owner belongs to",
      },
    }
  )
  .get(
    "/:token/issues",
    async ({ userId }) => {
      return IssuesService.getAllIssuesLightForUser(userId);
    },
    {
      params: t.Object({ token: t.String() }),
      detail: {
        summary: "Get my issues (light)",
        description:
          "Returns a lightweight list of issues assigned to the token owner — id, title, status, project. Use GET /issues/:issueId for full details.",
      },
    }
  )
  .get(
    "/:token/issues/:issueId",
    async ({ userId, params: { issueId } }) => {
      const issue = await IssuesService.getIssueFullForUser(userId, issueId);
      if (!issue) {
        throw new Error("Issue not found or access denied");
      }
      return issue;
    },
    {
      params: t.Object({ token: t.String(), issueId: t.Number() }),
      detail: {
        summary: "Get issue (full)",
        description:
          "Returns full issue info in a single request: issue fields, parent project (title, description, agents, repository), and all comments.",
      },
    }
  )
  .patch(
    "/:token/issues/:issueId/status",
    async ({ userId, params: { issueId }, body }) => {
      await IssuesService.updateIssueStatusByName(
        userId,
        issueId,
        body.status
      );
      return { ok: true };
    },
    {
      params: t.Object({ token: t.String(), issueId: t.Number() }),
      body: t.Object({ status: t.String() }),
      detail: {
        summary: "Change issue status",
        description: "Updates issue status by status name (e.g. 'done')",
      },
    }
  )
  .patch(
    "/:token/issues/:issueId",
    async ({ userId, params: { issueId }, body }) => {
      await IssuesService.updateIssueText(userId, issueId, body);
      return { ok: true };
    },
    {
      params: t.Object({ token: t.String(), issueId: t.Number() }),
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
      }),
      detail: {
        summary: "Update issue text",
        description:
          "Updates issue title and/or description without changing status or assignee",
      },
    }
  )
  .post(
    "/:token/issues/:issueId/comments",
    async ({ userId, params: { issueId }, body }) => {
      await CommentsService.insertComment(userId, issueId, body);
      return { ok: true };
    },
    {
      params: t.Object({ token: t.String(), issueId: t.Number() }),
      body: t.Object({ body: t.String() }),
      detail: {
        summary: "Add comment to issue",
        description: "Creates a new comment on the specified issue",
      },
    }
  )
  .patch(
    "/:token/issues/:issueId/comments/:commentId",
    async ({ userId, params: { commentId }, body }) => {
      await CommentsService.updateComment(userId, commentId, body.body);
      return { ok: true };
    },
    {
      params: t.Object({
        token: t.String(),
        issueId: t.Number(),
        commentId: t.Number(),
      }),
      body: t.Object({ body: t.String() }),
      detail: {
        summary: "Update comment body",
        description:
          "Rewrites the body of an existing comment. Only the original author may edit.",
      },
    }
  )
  .get(
    "/:token/issues/:issueId/comments",
    async ({ userId, params: { issueId } }) => {
      return CommentsService.getCommentsByIssueId(userId, issueId);
    },
    {
      params: t.Object({ token: t.String(), issueId: t.Number() }),
      detail: {
        summary: "Get issue comments",
        description: "Returns all comments for the specified issue",
      },
    }
  );
