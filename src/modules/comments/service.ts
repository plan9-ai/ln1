import { sql } from "bun";
import type {
  InsertCommentBody,
  IssueCommentsSelect,
} from "@/db/schema/issue-comments";
import { IssuesService } from "@/modules/issues/service";

export const CommentsService = {
  async insertComment(
    userId: string,
    issueId: number,
    data: InsertCommentBody
  ): Promise<void> {
    const issue = await IssuesService.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }

    const body = data.body?.trim();
    if (!body) {
      throw new Error("Body is required");
    }

    const now = Math.floor(Date.now() / 1000);
    const commentData = {
      issue_id: issueId,
      user_id: userId,
      body,
      created_at: now,
    };

    await sql`
      INSERT INTO issue_comments ${sql(commentData)}
    `;
  },

  async getCommentsByIssueId(
    userId: string,
    issueId: number
  ): Promise<IssueCommentsSelect[]> {
    const issue = await IssuesService.getIssueById(userId, issueId);
    if (!issue) {
      return [];
    }

    const comments = await sql`
      SELECT ic.id, ic.issue_id as "issueId", ic.user_id as "userId", ic.body, ic.created_at as "createdAt"
      FROM issue_comments ic
      JOIN issues i ON ic.issue_id = i.id
      JOIN projects p ON i.project_id = p.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE ic.issue_id = ${issueId}
      ORDER BY ic.created_at ASC
    `;
    return (comments ?? []) as IssueCommentsSelect[];
  },
};
