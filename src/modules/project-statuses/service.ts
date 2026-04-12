import { sql } from "bun";
import { ProjectsService } from "@/modules/projects/service";

export interface ProjectStatusView {
  id: number;
  name: string;
  slug: string;
  priority: number;
  isDefault: boolean;
}

export const ProjectStatusesService = {
  async getStatusesByProjectId(
    userId: string,
    projectId: number
  ): Promise<ProjectStatusView[]> {
    const project = await ProjectsService.getProjectById(userId, projectId);
    if (!project) {
      return [];
    }

    const statuses = await sql`
      SELECT id, name, slug, priority, is_default as "isDefault"
      FROM project_issue_statuses
      WHERE project_id = ${projectId}
      ORDER BY priority ASC
    `;
    return (Array.isArray(statuses) ? statuses : []) as ProjectStatusView[];
  },
};
