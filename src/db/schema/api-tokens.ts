import {
  integer,
  serial,
  pgTable as table,
  text,
} from "drizzle-orm/pg-core";

import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { usersTable } from "./users";

export const apiTokensTable = table("api_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const apiTokensInsertSchema = createInsertSchema(apiTokensTable);
export const apiTokensSelectSchema = createSelectSchema(apiTokensTable);