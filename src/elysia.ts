import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { adminRoutes } from "./modules/admin/routes";
import { myApiRoutes } from "./modules/api-tokens/routes";
import { getSessionForRequest } from "./lib/auth";
import { authEnsureSession } from "./lib/ensure-user-in-app-db";
import { getNotificationsForUser } from "./modules/notifications/service";
import { projectsRoutes } from "./modules/projects/routes";
import { uploadedFilesRoutes } from "./modules/uploaded-files/routes";

const notificationsRoutes = new Elysia({ prefix: "/notifications" }).get(
  "/",
  async ({ request }) => {
    const session = await authEnsureSession(() =>
      getSessionForRequest(request)
    );
    return getNotificationsForUser(session.user.id);
  }
);

export const api = new Elysia({ prefix: "/api" })
  .use(cors())
  .use(projectsRoutes)
  .use(uploadedFilesRoutes)
  .use(adminRoutes)
  .use(myApiRoutes)
  .use(notificationsRoutes);
