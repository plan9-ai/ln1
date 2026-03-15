import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { usersTable } from "./users";

export const teamsTable = table("teams", {
  id: serial("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => usersTable.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const teamsInsertSchema = createInsertSchema(teamsTable);
export const teamsSelectSchema = createSelectSchema(teamsTable);
export const teamsUpdateSchema = createUpdateSchema(teamsTable);
