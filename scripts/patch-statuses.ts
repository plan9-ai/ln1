// One-off idempotent data patch:
//   1. Rename every "reopened" status to "ready for release" (keeping its id).
//   2. Backfill missing slugs for the canonical default statuses, so UI code
//      that matches on slug (e.g. getStatusRowColor) works everywhere.
//
// Safe to re-run.

import "dotenv/config";
import { sql } from "bun";

const SLUG_BY_NAME: Record<string, string> = {
  backlog: "backlog",
  todo: "todo",
  "in progress": "in-progress",
  "in testing": "in-testing",
  reopened: "ready-for-release",
  "ready for release": "ready-for-release",
  done: "done",
};

const renamed = await sql`
  UPDATE project_issue_statuses
  SET name = 'ready for release', slug = 'ready-for-release'
  WHERE name = 'reopened'
  RETURNING id
`;
console.log(`Renamed ${renamed.length} "reopened" → "ready for release"`);

let backfilled = 0;
for (const [name, slug] of Object.entries(SLUG_BY_NAME)) {
  const rows = await sql`
    UPDATE project_issue_statuses
    SET slug = ${slug}
    WHERE name = ${name} AND (slug IS NULL OR slug = '')
    RETURNING id
  `;
  backfilled += rows.length;
}
console.log(`Backfilled slug for ${backfilled} rows`);

process.exit(0);
