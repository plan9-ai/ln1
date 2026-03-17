import { Elysia } from "elysia";
import { adminRoutes } from "./modules/admin/routes";
import { projectsRoutes } from "./modules/projects/routes";

export const api = new Elysia({ prefix: "/api" })
  .use(projectsRoutes)
  .use(adminRoutes);
