import { sql } from "bun";
import { getAuthUsersByIds } from "@/lib/get-auth-user-by-email";
import { notifyIssueAssigned } from "@/modules/notifications/service";
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import { ProjectsService } from "@/modules/projects/service";
import type {
  CreateIssueBody,
  IssueFullView,
  IssueListItem,
  IssueView,
  IssueWithContext,
  UpdateIssueBody,
} from "./model";

async function ensureAssigneeIsTeamMember(
  projectId: number,
  assigneeUserId: string
): Promise<void> {
  const [row] = await sql`
    SELECT 1 AS ok
    FROM team_members tm
    INNER JOIN projects p ON p.team_id = tm.team_id
    WHERE p.id = ${projectId} AND tm.user_id = ${assigneeUserId}
    LIMIT 1
  `;
  if (!row) {
    throw new Error("Invalid assignee");
  }
}

async function tryNotifyNewAssignee(params: {
  previousAssigneeUserId: string | null;
  newAssigneeUserId: string | null;
  teamSlug: string;
  projectId: number;
  issueId: number;
  title: string;
}): Promise<void> {
  if (
    !params.newAssigneeUserId ||
    params.newAssigneeUserId === params.previousAssigneeUserId
  ) {
    return;
  }
  try {
    const emails = await getAuthUsersByIds([params.newAssigneeUserId]);
    const to = emails.get(params.newAssigneeUserId);
    if (!to) {
      return;
    }
    await notifyIssueAssigned({
      userId: params.newAssigneeUserId,
      toEmail: to,
      teamSlug: params.teamSlug,
      projectId: params.projectId,
      issueId: params.issueId,
      issueTitle: params.title,
    });
  } catch {
    /* email must not fail issue save */
  }
}

export const IssuesService = {
  async createIssue(
    userId: string,
    projectId: number,
    data: CreateIssueBody
  ): Promise<{ id: number }> {
    const project = await ProjectsService.getProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === data.statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }

    const description = data.description?.trim() ?? "";
    const assigneeUserId = data.assigneeUserId ?? null;
    if (assigneeUserId) {
      await ensureAssigneeIsTeamMember(projectId, assigneeUserId);
    }

    const now = Math.floor(Date.now() / 1000);

    const [issue] = await sql.begin(async (tx) => {
      const [maxPriorityRow] = await tx`
        SELECT COALESCE(MAX(priority), -1) + 1 as next_priority
        FROM issues WHERE project_id = ${projectId} AND status_id = ${data.statusId}
      `;
      const priority = maxPriorityRow?.next_priority ?? 0;

      const issueData = {
        project_id: projectId,
        title,
        description,
        status_id: data.statusId,
        assignee_user_id: assigneeUserId,
        priority,
        created_at: now,
        updated_at: now,
      };

      return tx`
        INSERT INTO issues ${tx(issueData)}
        RETURNING id
      `;
    });
    if (!issue) {
      throw new Error("Failed to create issue");
    }

    const created = await this.getIssueById(userId, issue.id);
    if (created?.teamSlug && assigneeUserId) {
      await tryNotifyNewAssignee({
        previousAssigneeUserId: null,
        newAssigneeUserId: assigneeUserId,
        teamSlug: created.teamSlug,
        projectId,
        issueId: issue.id,
        title,
      });
    }

    return { id: issue.id };
  },

  async getIssueById(
    userId: string,
    issueId: number
  ): Promise<IssueView | null> {
    const [issue] = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        i.assignee_user_id as "assigneeUserId",
        pis.name as status, pis.slug as "statusSlug", i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt",
        t.slug as "teamSlug"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.id = ${issueId}
    `;
    return issue as IssueView | null;
  },

  async getIssuesByTeamSlug(
    userId: string,
    teamSlug: string
  ): Promise<IssueWithContext[]> {
    const issues = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        i.assignee_user_id as "assigneeUserId",
        pis.name as status, pis.slug as "statusSlug", i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt",
        t.slug as "teamSlug", p.title as "projectTitle"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE t.slug = ${teamSlug}
      ORDER BY i.updated_at DESC
    `;
    return (issues ?? []) as IssueWithContext[];
  },

  async getAllIssuesLightForUser(userId: string): Promise<IssueListItem[]> {
    const issues = await sql`
      SELECT i.id, i.title,
        pis.name as status, pis.slug as "statusSlug",
        i.project_id as "projectId", p.title as "projectTitle",
        t.slug as "teamSlug",
        i.assignee_user_id as "assigneeUserId",
        i.updated_at as "updatedAt"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.assignee_user_id = ${userId}
      ORDER BY i.updated_at DESC
    `;
    return (issues ?? []) as IssueListItem[];
  },

  async getIssueFullForUser(
    userId: string,
    issueId: number
  ): Promise<IssueFullView | null> {
    const [issue] = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        i.assignee_user_id as "assigneeUserId",
        pis.name as status, pis.slug as "statusSlug", i.priority,
        i.created_at as "createdAt", i.updated_at as "updatedAt",
        t.slug as "teamSlug", p.title as "projectTitle"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.id = ${issueId}
    `;
    if (!issue) {
      return null;
    }

    const [project] = await sql`
      SELECT p.id, p.title, p.description, p.agents, p.repository
      FROM projects p
      WHERE p.id = ${issue.projectId}
    `;

    const comments = await sql`
      SELECT id, user_id as "userId", body, created_at as "createdAt"
      FROM issue_comments
      WHERE issue_id = ${issueId}
      ORDER BY created_at ASC
    `;

    return {
      ...(issue as IssueWithContext),
      project: project as IssueFullView["project"],
      comments: (comments ?? []) as IssueFullView["comments"],
    };
  },

  async getAllIssuesForUser(userId: string): Promise<IssueWithContext[]> {
    const issues = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        i.assignee_user_id as "assigneeUserId",
        pis.name as status, pis.slug as "statusSlug", i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt",
        t.slug as "teamSlug", p.title as "projectTitle"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      ORDER BY i.updated_at DESC
    `;
    return (issues ?? []) as IssueWithContext[];
  },

  async getIssuesByProjectId(
    userId: string,
    projectId: number
  ): Promise<IssueView[]> {
    const issues = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        i.assignee_user_id as "assigneeUserId",
        pis.name as status, pis.slug as "statusSlug", i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.project_id = ${projectId}
      ORDER BY pis.priority ASC, i.priority ASC, i.created_at DESC
    `;
    return (issues ?? []) as IssueView[];
  },

  async updateIssue(
    userId: string,
    issueId: number,
    data: UpdateIssueBody
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      issue.projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === data.statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }

    const description = data.description?.trim() ?? "";
    const newAssigneeUserId = data.assigneeUserId ?? null;
    const previousAssigneeUserId = issue.assigneeUserId ?? null;
    if (newAssigneeUserId) {
      await ensureAssigneeIsTeamMember(issue.projectId, newAssigneeUserId);
    }

    const now = Math.floor(Date.now() / 1000);

    await sql`
      UPDATE issues
      SET title = ${title}, description = ${description}, status_id = ${data.statusId},
        assignee_user_id = ${newAssigneeUserId}, updated_at = ${now}
      WHERE id = ${issueId}
    `;

    const teamSlug = issue.teamSlug;
    if (teamSlug) {
      await tryNotifyNewAssignee({
        previousAssigneeUserId,
        newAssigneeUserId,
        teamSlug,
        projectId: issue.projectId,
        issueId,
        title,
      });
    }
  },

  async updateIssuesPrioritiesInStatus(
    userId: string,
    projectId: number,
    statusId: number,
    issueIds: number[]
  ): Promise<void> {
    const project = await ProjectsService.getProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }
    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }
    if (issueIds.length === 0) {
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    await sql.begin(async (tx) => {
      for (let i = 0; i < issueIds.length; i++) {
        await tx`
          UPDATE issues
          SET priority = ${i}, updated_at = ${now}
          WHERE id = ${issueIds[i]} AND project_id = ${projectId} AND status_id = ${statusId}
        `;
      }
    });
  },

  async moveIssueToStatus(
    userId: string,
    projectId: number,
    issueId: number,
    targetStatusId: number,
    targetIndex: number
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }
    if (issue.projectId !== projectId) {
      throw new Error("Issue does not belong to project");
    }
    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some(
      (s) => s.id === targetStatusId
    );
    if (!statusBelongsToProject) {
      throw new Error("Invalid target status");
    }

    const sourceStatusId = issue.statusId;
    const now = Math.floor(Date.now() / 1000);

    await sql.begin(async (tx) => {
      if (sourceStatusId === targetStatusId) {
        const issuesInStatus = await tx`
          SELECT id FROM issues
          WHERE project_id = ${projectId} AND status_id = ${targetStatusId}
          ORDER BY priority ASC, created_at DESC
        `;
        const ids = (issuesInStatus ?? []) as { id: number }[];
        const currentIndex = ids.findIndex((r) => r.id === issueId);
        if (currentIndex === -1 || currentIndex === targetIndex) {
          return;
        }
        const reordered = [...ids];
        const [removed] = reordered.splice(currentIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        for (let i = 0; i < reordered.length; i++) {
          await tx`
            UPDATE issues
            SET priority = ${i}, updated_at = ${now}
            WHERE id = ${reordered[i].id} AND project_id = ${projectId} AND status_id = ${targetStatusId}
          `;
        }
        return;
      }

      const issuesInTarget = await tx`
        SELECT id FROM issues
        WHERE project_id = ${projectId} AND status_id = ${targetStatusId}
        ORDER BY priority ASC, created_at DESC
      `;
      const targetIds = (issuesInTarget ?? []) as { id: number }[];
      const newOrder = [...targetIds.map((r) => r.id)];
      newOrder.splice(targetIndex, 0, issueId);

      await tx`
        UPDATE issues
        SET status_id = ${targetStatusId}, priority = ${targetIndex}, updated_at = ${now}
        WHERE id = ${issueId} AND project_id = ${projectId}
      `;

      for (let i = 0; i < newOrder.length; i++) {
        if (newOrder[i] === issueId) {
          continue;
        }
        await tx`
          UPDATE issues
          SET priority = ${i}, updated_at = ${now}
          WHERE id = ${newOrder[i]} AND project_id = ${projectId} AND status_id = ${targetStatusId}
        `;
      }

      const issuesInSource = await tx`
        SELECT id FROM issues
        WHERE project_id = ${projectId} AND status_id = ${sourceStatusId}
        ORDER BY priority ASC, created_at DESC
      `;
      const sourceIds = (issuesInSource ?? []) as { id: number }[];
      for (let i = 0; i < sourceIds.length; i++) {
        await tx`
          UPDATE issues
          SET priority = ${i}, updated_at = ${now}
          WHERE id = ${sourceIds[i].id} AND project_id = ${projectId} AND status_id = ${sourceStatusId}
        `;
      }
    });
  },

  async updateIssueText(
    userId: string,
    issueId: number,
    data: { title?: string; description?: string }
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }

    const title = (data.title?.trim() ?? issue.title).trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const description = data.description?.trim() ?? issue.description ?? "";
    const now = Math.floor(Date.now() / 1000);

    await sql`
      UPDATE issues
      SET title = ${title}, description = ${description}, updated_at = ${now}
      WHERE id = ${issueId}
    `;
  },

  async updateIssueStatusByName(
    userId: string,
    issueId: number,
    statusName: string
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }
    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      issue.projectId
    );
    const normalized = statusName.toLowerCase();
    const target = statuses.find(
      (s) => s.slug === normalized || s.name.toLowerCase() === normalized
    );
    if (!target) {
      throw new Error(`Status "${statusName}" not found in project`);
    }
    const now = Math.floor(Date.now() / 1000);
    await sql`
      UPDATE issues
      SET status_id = ${target.id}, updated_at = ${now}
      WHERE id = ${issueId}
    `;
  },
};
