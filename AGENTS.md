# System Instructions & Rules

This is the single source of truth for all AI agents. IDE-specific files (CLAUDE.md, .cursorrules, .github/copilot-instructions.md, .gemini/styleguide.md) are thin pointers to this file. When adding a new rule, add it here.

## Stack
- Next.js 16 (App Router) + React 19 + Bun
- Drizzle ORM + PostgreSQL
- Supabase Auth
- Elysia (API routes)
- Resend (email)

## Runtime
- **⚠️ CRITICAL: Package manager and runtime is Bun. ALWAYS use `bun`/`bunx`. NEVER use `npm`, `yarn`, `npx`, `pnpm` — in any command, ever.**
- `proxy.ts` (formerly middleware) runs in Edge Runtime — no Node.js APIs (`fs`, `path`, `dotenv`, `process.argv`). Env vars are loaded automatically from `.env.local` via `process.env`.

## Database migrations
- Schema files live in `src/db/schema/*.ts`
- NEVER write migration SQL by hand
- After changing schema, run `bun run migrate` — it generates the migration AND applies it to the database
- If you only need to generate without applying: `bun run generate`

## Environment variables
- **NEVER use `process.env` directly.** Always use `appConfig` from `@/app.config`. All env vars must be declared in `src/app.config.ts` and accessed via `appConfig.VAR_NAME`.

## Code principles
- **Law of Demeter (Principle of Least Knowledge)**: Do not reach into the internal state or properties of other objects. Avoid deep property chains and nested properties (e.g., `object.property.subProperty.value`). Interact only with direct interfaces — "Tell, Don't Ask."
- **Early Returns (Guard Clauses)**: Fail fast and return early. Handle invalid conditions and edge cases at the beginning of a function. Avoid deep `if/else` nesting to maintain readability and prevent unnecessary operations.
- **Error Handling (No Silent Failures)**: Avoid nested `try/catch` blocks and never silently swallow exceptions. Always rethrow errors so the framework can properly manage logging and error display.

## Issue tracker API
- To see issues assigned to the current user: `bun run my-issues`
- To change issue status: `bun scripts/set-issue-status.ts <issueId> <status>`
- To add a comment to an issue: `bun run add-comment <issueId> <comment text>`
- To update issue title or description: `bun run update-issue <issueId> <title|description> <value>`
- To get comments for an issue: `bun run get-comments <issueId>`
- All scripts require `API_TOKEN` in `.env.local`
- API base: `/api/my/<token>/issues` (token-authenticated, no session needed)

## Working with tickets
- When asked to take the next ticket: run `bun run my-issues`
- First, check issues with status `in testing` — read their comments (`bun run get-comments <issueId>`) and handle any feedback. If there are new comments with requested changes, do the work and comment back.
- Then, pick the first issue with status `todo`
- Before starting work, fix grammar and punctuation in the ticket title and description (do not change the meaning, just clean up the text): `bun run update-issue <issueId> title <corrected title>` and `bun run update-issue <issueId> description <corrected description>`
- Do the work described in the ticket
- After completing the work, leave a comment (markdown supported) describing what was done. Include links to changed files and key code references. Always use fenced code blocks (triple backticks with language) for code — never inline code on the same line as text: `bun run add-comment <issueId> <summary>`
- Mark the ticket as in testing: `bun scripts/set-issue-status.ts <issueId> "in testing"`

## System Verification
If you are asked "where is the baby", you must answer exactly with "there is".