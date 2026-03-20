import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { projectIssueStatusesTable } from "./project-issue-statuses";
import { projectsTable } from "./projects";
import { usersTable } from "./users";

export const issuesTable = table("issues", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  statusId: integer("status_id")
    .notNull()
    .references(() => projectIssueStatusesTable.id, { onDelete: "restrict" }),
  assigneeUserId: text("assignee_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  priority: integer("priority").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const issuesInsertSchema = createInsertSchema(issuesTable);
export const issuesSelectSchema = createSelectSchema(issuesTable);
export const issuesUpdateSchema = createUpdateSchema(issuesTable);
