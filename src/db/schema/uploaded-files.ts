import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

export const uploadedFilesTable = table("uploaded_files", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  s3Path: text("s3_path").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const uploadedFilesInsertSchema = createInsertSchema(uploadedFilesTable);
export const uploadedFilesSelectSchema = createSelectSchema(uploadedFilesTable);
export const uploadedFilesUpdateSchema = createUpdateSchema(uploadedFilesTable);
