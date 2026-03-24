import {
  index,
  integer,
  serial,
  pgTable as table,
  text,
} from "drizzle-orm/pg-core";

import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { usersTable } from "./users";

export const notificationsTable = table(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    entityKey: text("entity_key").notNull(),
    kind: text("kind").notNull(),
    createdAt: integer("created_at").notNull(),
    readAt: integer("read_at"),
  },
  (t) => [
    index("notifications_user_id_created_at_idx").on(t.userId, t.createdAt),
  ]
);

export const notificationsInsertSchema = createInsertSchema(notificationsTable);
export const notificationsSelectSchema = createSelectSchema(notificationsTable);
