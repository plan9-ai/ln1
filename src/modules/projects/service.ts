import { sql } from "bun";
import type { ProjectsInsert } from "@/db/schema/projects";
import { TeamsService } from "@/modules/teams/service";

export const ProjectsService = {
  async createProject(
    userId: string,
    teamSlug: string,
    data: Pick<ProjectsInsert, "title" | "description">
  ): Promise<{ id: number }> {
    const teams = await TeamsService.getTeamsByUserId(userId);
    const team = teams.find((t) => t.slug === teamSlug);
    if (!team) {
      throw new Error("Team not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    const projectData = {
      team_id: team.id,
      title,
      description,
      created_at: now,
      updated_at: now,
    };

    const [project] = await sql`
      INSERT INTO projects ${sql(projectData)}
      RETURNING id
    `;
    if (!project) {
      throw new Error("Failed to create project");
    }

    const defaultStatuses = [
      { name: "backlog", priority: 0, is_default: true },
      { name: "todo", priority: 1, is_default: false },
      { name: "in progress", priority: 2, is_default: false },
      { name: "in testing", priority: 3, is_default: false },
      { name: "reopened", priority: 4, is_default: false },
      { name: "done", priority: 5, is_default: false },
    ];
    for (const s of defaultStatuses) {
      await sql`
        INSERT INTO project_issue_statuses (project_id, name, priority, is_default)
        VALUES (${project.id}, ${s.name}, ${s.priority}, ${s.is_default})
      `;
    }

    return { id: project.id };
  },

  async getAllProjectsForUser(
    userId: string
  ): Promise<
    { id: number; title: string; repository: string | null; teamSlug: string }[]
  > {
    const rows = await sql`
      SELECT p.id, p.title, p.repository, t.slug as "teamSlug"
      FROM projects p
      JOIN teams t ON p.team_id = t.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      ORDER BY t.slug ASC, p.title ASC
    `;
    return (Array.isArray(rows) ? rows : []) as {
      id: number;
      title: string;
      repository: string | null;
      teamSlug: string;
    }[];
  },

  async getProjectsByTeamSlug(
    userId: string,
    teamSlug: string
  ): Promise<{ id: number; title: string }[]> {
    const teams = await TeamsService.getTeamsByUserId(userId);
    const team = teams.find((t) => t.slug === teamSlug);
    if (!team) {
      return [];
    }

    const result = await sql`
      SELECT id, title
      FROM projects
      WHERE team_id = ${team.id}
      ORDER BY title ASC
    `;
    return (Array.isArray(result) ? result : []) as {
      id: number;
      title: string;
    }[];
  },

  async getProjectById(
    userId: string,
    projectId: number
  ): Promise<{
    id: number;
    title: string;
    description: string;
    agents: string;
    repository: string | null;
  } | null> {
    const [project] = await sql`
      SELECT p.id, p.title, p.description, p.agents, p.repository
      FROM projects p
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE p.id = ${projectId}
    `;
    return project as {
      id: number;
      title: string;
      description: string;
      agents: string;
      repository: string | null;
    } | null;
  },

  async updateProject(
    userId: string,
    projectId: number,
    data: { title?: string; description?: string; agents?: string; repository?: string }
  ): Promise<void> {
    const project = await this.getProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }

    const now = Math.floor(Date.now() / 1000);
    await sql`
      UPDATE projects
      SET title = ${data.title ?? project.title},
          description = ${data.description ?? project.description},
          agents = ${data.agents ?? project.agents},
          repository = ${data.repository ?? project.repository ?? ""},
          updated_at = ${now}
      WHERE id = ${projectId}
    `;
  },
};
