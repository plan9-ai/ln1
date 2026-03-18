import { sql } from "bun";
import { IssuesService } from "@/modules/issues/service";

const ISSUES_KEY_REGEX = /^issues-(\d+)$/;

export interface UploadedFileView {
  id: number;
  key: string;
  s3Path: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

export const UploadedFilesService = {
  async getByKey(userId: string, key: string): Promise<UploadedFileView[]> {
    await this.assertCanAccessKey(userId, key);

    const rows = await sql`
      SELECT id, key, s3_path as "s3Path", filename, mime_type as "mimeType", size, created_at as "createdAt"
      FROM uploaded_files
      WHERE key = ${key}
      ORDER BY created_at DESC
    `;
    return (rows ?? []) as UploadedFileView[];
  },

  async getById(userId: string, id: number): Promise<UploadedFileView | null> {
    const [row] = await sql`
      SELECT id, key, s3_path as "s3Path", filename, mime_type as "mimeType", size, created_at as "createdAt"
      FROM uploaded_files
      WHERE id = ${id}
    `;
    if (!row) {
      return null;
    }
    await this.assertCanAccessKey(userId, (row as { key: string }).key);
    return row as UploadedFileView;
  },

  async assertCanAccessKey(userId: string, key: string): Promise<void> {
    const match = ISSUES_KEY_REGEX.exec(key);
    if (match) {
      const issueId = Number.parseInt(match[1], 10);
      const issue = await IssuesService.getIssueById(userId, issueId);
      if (!issue) {
        throw new Error("Access denied");
      }
      return;
    }
    throw new Error("Invalid key");
  },

  async create(
    key: string,
    s3Path: string,
    filename: string,
    mimeType: string,
    size: number
  ): Promise<{ id: number; filename: string; s3Path: string }> {
    const now = Math.floor(Date.now() / 1000);
    const [row] = await sql`
      INSERT INTO uploaded_files (key, s3_path, filename, mime_type, size, created_at)
      VALUES (${key}, ${s3Path}, ${filename}, ${mimeType}, ${size}, ${now})
      RETURNING id, filename, s3_path as "s3Path"
    `;
    if (!row) {
      throw new Error("Failed to create uploaded file record");
    }
    return row as { id: number; filename: string; s3Path: string };
  },

  async delete(userId: string, id: number): Promise<void> {
    const file = await this.getById(userId, id);
    if (!file) {
      throw new Error("File not found");
    }
    await sql`DELETE FROM uploaded_files WHERE id = ${id}`;
  },
};
