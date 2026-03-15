CREATE TABLE IF NOT EXISTS "project_issue_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"priority" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_issue_statuses" ADD CONSTRAINT "project_issue_statuses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "status_id" integer;
--> statement-breakpoint
INSERT INTO "project_issue_statuses" ("project_id", "name", "priority", "is_default")
SELECT p.id, s.name, s.priority, s.is_default
FROM "projects" p
CROSS JOIN (VALUES
  ('backlog'::text, 0, true),
  ('todo'::text, 1, false),
  ('in progress'::text, 2, false),
  ('in testing'::text, 3, false),
  ('reopened'::text, 4, false),
  ('done'::text, 5, false)
) AS s(name, priority, is_default);
--> statement-breakpoint
UPDATE "issues" i
SET "status_id" = (
  SELECT pis.id
  FROM "project_issue_statuses" pis
  WHERE pis.project_id = i.project_id
    AND LOWER(TRIM(pis.name)) = LOWER(TRIM(i.status))
  LIMIT 1
)
WHERE i.status_id IS NULL;
--> statement-breakpoint
UPDATE "issues" i
SET "status_id" = (
  SELECT pis.id
  FROM "project_issue_statuses" pis
  WHERE pis.project_id = i.project_id
  ORDER BY pis.priority ASC
  LIMIT 1
)
WHERE i.status_id IS NULL;
--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "status_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN IF EXISTS "status";
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_status_id_project_issue_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."project_issue_statuses"("id") ON DELETE restrict ON UPDATE no action;
