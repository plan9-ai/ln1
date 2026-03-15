import { pgTable as table, text } from "drizzle-orm/pg-core";

export const usersTable = table("users", {
  id: text("id").primaryKey(),
});
