CREATE TYPE "public"."team_invite_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "team_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"email" text NOT NULL,
	"role" "team_member_role" NOT NULL,
	"token" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"status" "team_invite_status" DEFAULT 'pending' NOT NULL,
	"created_at" integer NOT NULL,
	CONSTRAINT "team_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;