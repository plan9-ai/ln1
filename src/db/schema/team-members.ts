import {
  integer,
  pgEnum,
  primaryKey,
  pgTable as table,
  text,
} from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const teamMemberRoleEnum = pgEnum("team_member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const teamMembersTable = table(
  "team_members",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teamsTable.id, { onDelete: "cascade" }),
    role: teamMemberRoleEnum("role").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.teamId] })]
);

export const teamMembersInsertSchema = createInsertSchema(teamMembersTable);
export const teamMembersSelectSchema = createSelectSchema(teamMembersTable);
export const teamMembersUpdateSchema = createUpdateSchema(teamMembersTable);
