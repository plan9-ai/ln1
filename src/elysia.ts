import { Elysia } from "elysia";
import { adminRoutes } from "./modules/admin/routes";
import { projectsRoutes } from "./modules/projects/routes";
import { uploadedFilesRoutes } from "./modules/uploaded-files/routes";

export const api = new Elysia({ prefix: "/api" })
  .use(projectsRoutes)
  .use(uploadedFilesRoutes)
  .use(adminRoutes);
