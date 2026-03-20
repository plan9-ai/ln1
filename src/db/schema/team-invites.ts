import {
  integer,
  pgEnum,
  serial,
  pgTable as table,
  text,
} from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { teamMemberRoleEnum } from "./team-members";
import { teamsTable } from "./teams";
import { usersTable } from "./users";

export const teamInviteStatusEnum = pgEnum("team_invite_status", [
  "pending",
  "accepted",
]);

export const teamInvitesTable = table("team_invites", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teamsTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: teamMemberRoleEnum("role").notNull(),
  token: text("token").notNull().unique(),
  invitedByUserId: text("invited_by_user_id")
    .notNull()
    .references(() => usersTable.id),
  status: teamInviteStatusEnum("status").notNull().default("pending"),
  createdAt: integer("created_at").notNull(),
});

export const teamInvitesInsertSchema = createInsertSchema(teamInvitesTable);
export const teamInvitesSelectSchema = createSelectSchema(teamInvitesTable);
export const teamInvitesUpdateSchema = createUpdateSchema(teamInvitesTable);
