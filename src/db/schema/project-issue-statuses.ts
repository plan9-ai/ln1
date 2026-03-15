import {
  boolean,
  integer,
  serial,
  pgTable as table,
  text,
} from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { projectsTable } from "./projects";

export const projectIssueStatusesTable = table("project_issue_statuses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priority: integer("priority").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const projectIssueStatusesInsertSchema = createInsertSchema(
  projectIssueStatusesTable
);
export const projectIssueStatusesSelectSchema = createSelectSchema(
  projectIssueStatusesTable
);
export const projectIssueStatusesUpdateSchema = createUpdateSchema(
  projectIssueStatusesTable
);

export type ProjectIssueStatusesSelect =
  typeof projectIssueStatusesTable.$inferSelect;
export type ProjectIssueStatusesInsert =
  typeof projectIssueStatusesTable.$inferInsert;
