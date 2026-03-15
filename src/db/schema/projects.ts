import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { teamsTable } from "./teams";

export const projectsTable = table("projects", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teamsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const projectsInsertSchema = createInsertSchema(projectsTable);
export const projectsSelectSchema = createSelectSchema(projectsTable);
export const projectsUpdateSchema = createUpdateSchema(projectsTable);

export type ProjectsSelect = typeof projectsTable.$inferSelect;
export type ProjectsInsert = typeof projectsTable.$inferInsert;
