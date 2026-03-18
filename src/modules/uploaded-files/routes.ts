import { randomUUID } from "node:crypto";
import { Elysia, t } from "elysia";
import { appConfig } from "@/app.config";
import { getSessionForRequest } from "@/lib/auth";
import { authEnsureSession } from "@/lib/ensure-user-in-app-db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  uploadedFilesIdParamsSchema,
  uploadedFilesKeyQuerySchema,
} from "@/modules/uploaded-files/schema";
import { UploadedFilesService } from "@/modules/uploaded-files/service";

const PATH_SEPARATOR_REGEX = /[/\\]/;
const NULL_BYTE_REGEX = /[\0]/g;

function sanitizeFilename(name: string): string {
  const basename = name.split(PATH_SEPARATOR_REGEX).pop() ?? "file";
  return basename.replace(NULL_BYTE_REGEX, "");
}

export const uploadedFilesRoutes = new Elysia({
  prefix: "/uploaded-files",
})
  .get(
    "/",
    async ({ query, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const files = await UploadedFilesService.getByKey(
        session.user.id,
        query.key
      );
      return files;
    },
    {
      query: uploadedFilesKeyQuerySchema,
    }
  )
  .post(
    "/",
    async ({ body, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      await UploadedFilesService.assertCanAccessKey(session.user.id, body.key);

      const file = body.file as File;
      const sanitized = sanitizeFilename(file.name);
      const s3Path = `${body.key}/${randomUUID()}-${sanitized}`;

      const supabase = createAdminClient();
      const bucket = appConfig.SUPABASE_UPLOADS_BUCKET;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(s3Path, file, { upsert: false });

      if (error) {
        throw new Error(error.message);
      }

      const result = await UploadedFilesService.create(
        body.key,
        s3Path,
        file.name,
        file.type || "application/octet-stream",
        file.size
      );
      return result;
    },
    {
      body: t.Object({
        file: t.File(),
        key: t.String({ minLength: 1 }),
      }),
      type: "multipart/form-data",
    }
  )
  .get(
    "/:id/download",
    async ({ params, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const id = Number.parseInt(params.id, 10);
      const file = await UploadedFilesService.getById(session.user.id, id);
      if (!file) {
        return new Response(null, { status: 404 });
      }

      const supabase = createAdminClient();
      const bucket = appConfig.SUPABASE_UPLOADS_BUCKET;
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(file.s3Path, 60);

      if (data?.signedUrl) {
        return Response.redirect(data.signedUrl);
      }
      return new Response(null, { status: 500 });
    },
    {
      params: uploadedFilesIdParamsSchema,
    }
  )
  .delete(
    "/:id",
    async ({ params, request }) => {
      const session = await authEnsureSession(() =>
        getSessionForRequest(request)
      );
      const id = Number.parseInt(params.id, 10);
      const file = await UploadedFilesService.getById(session.user.id, id);
      if (!file) {
        return new Response(null, { status: 404 });
      }

      const supabase = createAdminClient();
      const bucket = appConfig.SUPABASE_UPLOADS_BUCKET;
      await supabase.storage.from(bucket).remove([file.s3Path]);

      await UploadedFilesService.delete(session.user.id, id);
      return { ok: true };
    },
    {
      params: uploadedFilesIdParamsSchema,
    }
  );
