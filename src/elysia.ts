import { Elysia } from "elysia";
import { authView } from "@/lib/auth-view";
import { projectsRoutes } from "./modules/projects/routes";

export const api = new Elysia({ prefix: "/api" })
  .use(projectsRoutes)
  .all("/auth/*", authView);
