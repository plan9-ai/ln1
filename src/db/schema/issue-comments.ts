import { Type } from "@sinclair/typebox";
import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { issuesTable } from "./issues";
import { usersTable } from "./users";

export const issueCommentsTable = table("issue_comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id")
    .notNull()
    .references(() => issuesTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const issueCommentsInsertSchema = createInsertSchema(issueCommentsTable);
export const issueCommentsSelectSchema = createSelectSchema(issueCommentsTable);
export const issueCommentsUpdateSchema = createUpdateSchema(issueCommentsTable);

export type IssueCommentsSelect = typeof issueCommentsTable.$inferSelect;
export type IssueCommentsInsert = typeof issueCommentsTable.$inferInsert;

export const insertCommentBodySchema = Type.Omit(issueCommentsInsertSchema, [
  "id",
  "issueId",
  "userId",
  "createdAt",
]);

export type InsertCommentBody = Omit<
  IssueCommentsInsert,
  "id" | "issueId" | "userId" | "createdAt"
>;
